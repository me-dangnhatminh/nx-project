import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function statusDelete(
  input: {} = {},
  context: { requesterId: string; projectId: string; statusId: string },
) {
  return prisma.$transaction(async (tx) => {
    const status = await tx.issueStatus.findUnique({ where: { id: context.statusId } });
    if (!status) throw new Error('Status not found');

    // Delete the status
    await tx.issueStatus.delete({ where: { id: context.statusId } });

    // Optionally, handle any cleanup or related operations here

    return;
  });
}
