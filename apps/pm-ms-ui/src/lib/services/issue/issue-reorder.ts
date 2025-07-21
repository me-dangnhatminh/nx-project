import { ReorderIssueInput } from 'apps/pm-ms-ui/src/lib/schemas/issue';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import lexorank from 'apps/pm-ms-ui/src/lib/utils/lexorank';

export default async function issueReorder(
  input: ReorderIssueInput,
  context: { requesterId: string; projectId: string },
) {
  return prisma.$transaction(
    async (tx) => {
      const { source, dest } = input;
      const { projectId } = context;

      // Validate source issues
      const movingIssues = await tx.issue.findMany({
        where: {
          projectId,
          id: { in: source.ids },
        },
        orderBy: { rank: 'asc' },
      });

      if (movingIssues.length !== source.ids.length) {
        throw new Error('Some source issues not found');
      }

      // Get target issues for rank calculation
      let targetIssues: Array<{ id: string; rank: string }>;

      if (dest.statusId) {
        // Moving to specific status - get issues in that status (excluding moving issues)
        targetIssues = await tx.issue.findMany({
          where: {
            projectId,
            statusId: dest.statusId,
            id: { notIn: source.ids },
          },
          select: { id: true, rank: true },
          orderBy: { rank: 'asc' },
        });
      } else {
        // Reordering within current status(es) - get all issues (excluding moving issues)
        targetIssues = await tx.issue.findMany({
          where: {
            projectId,
            id: { notIn: source.ids },
          },
          select: { id: true, rank: true },
          orderBy: { rank: 'asc' },
        });
      }

      // Calculate new ranks for moving issues
      const newRanks: string[] = [];

      if (!dest.destType) {
        // Add at the end
        if (targetIssues.length === 0) {
          // Empty target, use middle ranks
          newRanks.push(...lexorank.generateInitial(source.ids.length));
        } else {
          // Add after last target issue
          const lastRank = targetIssues[targetIssues.length - 1].rank;
          for (let i = 0; i < source.ids.length; i++) {
            const prevRank = i === 0 ? lastRank : newRanks[i - 1];
            newRanks.push(lexorank.between(prevRank, lexorank.max()));
          }
        }
      } else if (dest.destType === 'after') {
        // Insert after specific issue
        if (!dest.destParam) {
          throw new Error('Destination parameter required for "after" operation');
        }

        const destIndex = targetIssues.findIndex((issue) => issue.id === dest.destParam);
        if (destIndex === -1) {
          throw new Error('Destination issue not found or is being moved');
        }

        const afterRank = targetIssues[destIndex].rank;
        const beforeRank =
          destIndex + 1 < targetIssues.length ? targetIssues[destIndex + 1].rank : lexorank.max();

        // Generate ranks between afterRank and beforeRank
        if (source.ids.length === 1) {
          newRanks.push(lexorank.between(afterRank, beforeRank));
        } else {
          newRanks.push(...lexorank.betweenMultiple(afterRank, beforeRank, source.ids.length));
        }
      } else if (dest.destType === 'before') {
        // Insert before specific issue
        if (!dest.destParam) {
          throw new Error('Destination parameter required for "before" operation');
        }

        const destIndex = targetIssues.findIndex((issue) => issue.id === dest.destParam);
        if (destIndex === -1) {
          throw new Error('Destination issue not found or is being moved');
        }

        const beforeRank = targetIssues[destIndex].rank;
        const afterRank = destIndex > 0 ? targetIssues[destIndex - 1].rank : lexorank.min();

        // Generate ranks between afterRank and beforeRank
        if (source.ids.length === 1) {
          newRanks.push(lexorank.between(afterRank, beforeRank));
        } else {
          newRanks.push(...lexorank.betweenMultiple(afterRank, beforeRank, source.ids.length));
        }
      } else {
        throw new Error('Invalid destination type');
      }

      // Update issues with new ranks and optionally new status
      const updatePromises = source.ids.map((issueId, index) => {
        const updateData: { statusId?: string; rank: string; updatedAt: Date } = {
          rank: newRanks[index],
          updatedAt: new Date(),
        };

        if (dest.statusId) updateData.statusId = dest.statusId;
        return tx.issue.update({ where: { id: issueId }, data: updateData });
      });

      const updatedIssues = await Promise.all(updatePromises);

      return {
        success: true,
        updatedIssues,
        message: `Successfully reordered ${source.ids.length} issue(s)`,
      };
    },
    { isolationLevel: 'Serializable' },
  );
}
