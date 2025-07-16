import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function gIssueList(params: { projectId: string; statusId?: string }) {
  const items = await prisma.issue.findMany({
    where: { projectId: params.projectId, statusId: params.statusId },
    orderBy: { rank: 'asc' },
    include: { status: true, assignee: true, reporter: true, project: true },
  });

  return { items, total: items.length };
}
