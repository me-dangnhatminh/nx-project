import { UpdateStatusInput } from 'apps/pm-ms-ui/src/lib/schemas/status';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function statusUpdate(
  input: UpdateStatusInput,
  context: { requesterId: string; statusId: string },
) {
  return prisma.$transaction(async (tx) => {
    const status = await tx.issueStatus.findUnique({ where: { id: context.statusId } });
    if (!status) throw new Error('Status not found');

    const updatedStatus = await tx.issueStatus.update({
      where: { id: context.statusId },
      data: {
        name: input.name ?? status.name,
        description: input.description ?? status.description,
        color: input.color ?? status.color,
      },
    });

    if (input.sequence === undefined) return;
    throw new Error('Sequence update not handled in this function');
  });
}
