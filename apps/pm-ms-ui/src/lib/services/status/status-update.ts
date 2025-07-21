import { UpdateIssueStatusInput } from 'apps/pm-ms-ui/src/lib/schemas/issue-status';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function statusUpdate(
  input: UpdateIssueStatusInput,
  context: { requesterId: string; statusId: string },
) {
  return prisma.$transaction(async (tx) => {
    const status = await tx.issueStatus.findUnique({ where: { id: context.statusId } });
    if (!status) throw new Error('Status not found');

    await tx.issueStatus.update({
      where: { id: context.statusId },
      data: {
        name: input.name ?? status.name,
        description: input.description ?? status.description,
        color: input.color ?? status.color,
      },
    });

    if (input.sequence === undefined) return;

    const allStatuses = await tx.issueStatus.findMany({
      where: { projectId: status.projectId },
      orderBy: { sequence: 'asc' },
    });

    const currentSequence = allStatuses.findIndex((s) => s.id === context.statusId);
    if (currentSequence === -1) throw new Error('Status not found in project');
    if (currentSequence === input.sequence) return;
    if (input.sequence < 1 || input.sequence > allStatuses.length) {
      throw new Error('Sequence out of bounds');
    }
    const newStatuses = [...allStatuses];
    newStatuses.splice(currentSequence, 1);
    newStatuses.splice(input.sequence - 1, 0, status);
    await Promise.all(
      newStatuses.map((s, index) =>
        tx.issueStatus.update({
          where: { id: s.id },
          data: { sequence: index + 1 },
        }),
      ),
    );
  });
}
