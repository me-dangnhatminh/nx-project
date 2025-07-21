import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import { ReorderIssueStatusSchema } from 'apps/pm-ms-ui/src/lib/schemas/issue-status';

type Context = { params: Promise<{ id: string }> };
export async function POST(request: NextRequest, { params }: Context) {
  const { id: projectId } = await params;
  const body = await request.json();
  const valid = ReorderIssueStatusSchema.parse(body);

  await prisma.$transaction(
    async (tx) => {
      const { source, dest } = valid;

      // Validate source
      const statuses = await tx.issueStatus.findMany({
        where: { projectId, id: { in: source.map((s) => s.id) } },
        orderBy: { sequence: 'asc' },
      });
      if (statuses.length !== source.length) {
        throw new Error('Invalid source status IDs');
      }

      const allStatuses = await tx.issueStatus.findMany({
        where: { projectId },
        orderBy: { sequence: 'asc' },
      });

      // Create map of moving statuses
      const movingStatusIds = new Set(statuses.map((s) => s.id));

      // Filter out moving statuses from all statuses
      const remainingStatuses = allStatuses.filter((s) => !movingStatusIds.has(s.id));

      let finalStatusOrder: Array<{ id: string }>;

      if (!dest?.destType) {
        // ✅ No destType = add at the end
        finalStatusOrder = [...remainingStatuses, ...statuses];
      } else if (dest.destType === 'after') {
        // ✅ Insert after specific status
        if (!dest.destParam) {
          throw new Error('Destination parameter required for "after" operation');
        }

        const destIndex = remainingStatuses.findIndex((s) => s.id === dest.destParam);
        if (destIndex === -1) {
          throw new Error('Destination status not found or is being moved');
        }

        finalStatusOrder = [
          ...remainingStatuses.slice(0, destIndex + 1), // before + destination
          ...statuses, // inserted statuses
          ...remainingStatuses.slice(destIndex + 1), // after destination
        ];
      } else if (dest.destType === 'before') {
        // ✅ Insert before specific status
        if (!dest.destParam) {
          throw new Error('Destination parameter required for "before" operation');
        }

        const destIndex = remainingStatuses.findIndex((s) => s.id === dest.destParam);
        if (destIndex === -1) {
          throw new Error('Destination status not found or is being moved');
        }

        finalStatusOrder = [
          ...remainingStatuses.slice(0, destIndex), // before destination
          ...statuses, // inserted statuses
          ...remainingStatuses.slice(destIndex), // destination + after
        ];
      } else {
        throw new Error('Invalid destination type. Must be "before", "after", or undefined');
      }

      // ✅ Update sequences starting from 0
      const updatePromises = finalStatusOrder.map((status, index) => {
        return tx.issueStatus.update({
          where: { id: status.id },
          data: { sequence: index },
        });
      });

      await Promise.all(updatePromises);
    },
    {
      isolationLevel: 'Serializable',
    },
  );

  return NextResponse.json({ message: 'Issue statuses reordered successfully' });
}
