import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import { CreateStatusInput } from 'apps/pm-ms-ui/src/lib/schemas/status';

export default async function statusCreate(
  input: CreateStatusInput,
  context: { userId: string; projectId: string },
): Promise<void> {
  return await prisma.$transaction(
    async (tx) => {
      const { projectId } = context;

      const maxSequence = await tx.issueStatus.aggregate({ _max: { sequence: true } });
      const sequence = maxSequence._max.sequence ? maxSequence._max.sequence + 1 : 1;
      const status = await prisma.issueStatus.create({
        data: {
          name: input.name,
          projectId: projectId,
          description: input.description || `Status: ${input.name}`,
          color: input.color || '#6B7280', // Default gray color
          sequence: sequence,
        },
      });
    },
    {
      isolationLevel: 'Serializable',
      timeout: 10000, // 10 seconds
      maxWait: 5000, // 5 seconds
    },
  );
}
