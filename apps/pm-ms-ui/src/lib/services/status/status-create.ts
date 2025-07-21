import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import { CreateIssueStatusInput } from 'apps/pm-ms-ui/src/lib/schemas/issue-status';

export default async function statusCreate(
  input: CreateIssueStatusInput,
  context: { userId: string; projectId: string },
) {
  return await prisma.$transaction(
    async (tx) => {
      const { projectId } = context;
      const maxSequence = await tx.issueStatus.aggregate({ _max: { sequence: true } });
      const sequence = maxSequence._max.sequence ? maxSequence._max.sequence + 1 : 1;
      const status = await prisma.issueStatus.create({ data: { ...input, projectId, sequence } });
      return status;
    },
    {
      isolationLevel: 'Serializable',
      timeout: 10000, // 10 seconds
      maxWait: 5000, // 5 seconds
    },
  );
}
