import { ReorderStatusInput } from 'apps/pm-ms-ui/src/lib/schemas/status';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function statusReorder(
  input: ReorderStatusInput,
  context: { userId: string; projectId: string },
) {
  return prisma.$transaction(
    async (tx) => {
      const status = input.status;
      const exits = await tx.issueStatus.findUnique({
        where: { id: status.id, projectId: context.projectId },
        select: { id: true, sequence: true },
      });
      if (!exits) throw new Error('Status not found');

      const statuses = await tx.issueStatus.findMany({
        where: { projectId: context.projectId },
        orderBy: { sequence: 'asc' },
        select: { id: true, sequence: true },
      });

      const index = statuses.findIndex((s) => s.id === status.id);
      if (index === -1) throw new Error('Status not found in project');
      if (status.sequence === exits.sequence) return;

      if (status.sequence < 1 || status.sequence > statuses.length) {
        throw new Error('Invalid sequence number');
      }

      statuses.splice(index, 1);
      statuses.splice(status.sequence - 1, 0, exits);
      statuses.forEach((s, idx) => (s.sequence = idx + 1));

      await Promise.all(
        statuses.map((s) =>
          tx.issueStatus.update({ where: { id: s.id }, data: { sequence: s.sequence } }),
        ),
      );
    },
    {
      isolationLevel: 'Serializable',
      timeout: 10000, // 10 seconds
      maxWait: 5000, // 5 seconds
    },
  );
}
