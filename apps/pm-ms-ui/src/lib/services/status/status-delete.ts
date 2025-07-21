import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function statusDelete(
  input: { statusId: string },
  _context: { requesterId: string; projectId: string },
) {
  return prisma.$transaction(async (tx) => {
    const status = await tx.issueStatus.findUnique({ where: { id: input.statusId } });
    if (!status) throw new Error('Status not found');
    await tx.issueStatus.delete({ where: { id: input.statusId } });
    // Optionally, handle any cleanup or related operations here
  });
}
