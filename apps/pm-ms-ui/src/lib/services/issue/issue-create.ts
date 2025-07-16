import { CreateIssueInput } from 'apps/pm-ms-ui/src/lib/schemas/issue';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import z from 'zod';
import lexorank from '../../utils/lexorank';

// Lexorank

const IntoSchema = z.object({ before: z.string().optional(), after: z.string().optional() });
type IntoSchema = z.infer<typeof IntoSchema>;

export default async function issueCreate(
  input: { issue: CreateIssueInput; into?: IntoSchema },
  context: { requesterId: string },
) {
  return prisma.$transaction(
    async (tx) => {
      const issueInput = input.issue;
      const projectId = issueInput.projectId;
      if (issueInput.assigneeId) {
        const exits = await tx.user.findUnique({ where: { id: issueInput.assigneeId } });
        if (!exits) throw new Error('Assignee does not exist in project');
      }

      if (issueInput.reporterId) {
        const exits = await tx.user.findUnique({ where: { id: issueInput.reporterId } });
        if (!exits) throw new Error('Reporter does not exist in project');
      }

      const project = await tx.project.findUnique({ where: { id: projectId } });
      if (!project) throw new Error('Project does not exist');

      const lastIssue = await tx.issue.findFirst({
        where: { projectId },
        orderBy: { rank: 'desc' },
        take: 1,
      });

      const nextRank = lastIssue
        ? lexorank.genNext(lastIssue.rank || lexorank.genInitialRank())
        : lexorank.genInitialRank();

      // fix ==================
      await tx.issueType.upsert({
        where: { id: issueInput.typeId },
        create: { id: issueInput.typeId, name: 'Default Type', projectId },
        update: {},
      });

      await tx.issuePriority.upsert({
        where: { id: issueInput.priorityId },
        create: { id: issueInput.priorityId, name: 'Default Priority', projectId },
        update: {},
      });
      // ==================

      const [types, statuses, priorities] = await Promise.all([
        tx.issueType.findMany({ where: { projectId }, select: { id: true } }),
        tx.issueStatus.findMany({ where: { projectId }, select: { id: true } }),
        tx.issuePriority.findMany({ where: { projectId }, select: { id: true } }),
      ]);

      // if (!types.some((type) => type.id === issue.typeId)) {
      //   throw new Error('Issue type does not exist in project');
      // }

      if (!statuses.some((s) => s.id === issueInput.statusId)) {
        throw new Error('Issue status does not exist in project');
      }

      // if (!priorities.some((priority) => priority.id === issue.priorityId)) {
      //   throw new Error('Issue priority does not exist in project');
      // }

      const issue = await tx.issue.create({
        data: {
          key: issueInput.key,
          summary: issueInput.summary,
          description: issueInput.description,
          typeId: issueInput.typeId,
          statusId: issueInput.statusId,
          priorityId: issueInput.priorityId,
          projectId: issueInput.projectId,
          reporterId: issueInput.reporterId,
          assigneeId: issueInput.assigneeId,
          dueDate: issueInput.dueDate ? new Date(issueInput.dueDate) : null,
          resolutionId: issueInput.resolutionId,
          creatorId: context.requesterId,
          rank: nextRank,
        },
      });
    },
    { isolationLevel: 'Serializable' },
  );
}
