import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function qStatusList({ projectId }: { projectId: string }) {
  const statuses = await prisma.issueStatus.findMany({
    where: { projectId },
    orderBy: { sequence: 'asc' },
  });
  return { items: statuses, total: statuses.length };
}
