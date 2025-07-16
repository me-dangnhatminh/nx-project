import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function issueDelete(input: { projectId: string; issueId: string }) {
  return prisma.$transaction(async (tx) => {
    const issue = await tx.issue.findUnique({
      where: { id: input.issueId, projectId: input.projectId },
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    await tx.issue.delete({ where: { id: input.issueId } });
  });
}
