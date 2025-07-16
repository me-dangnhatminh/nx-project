import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function issueListBoard(
  params: {
    projectId: string;
  },
  context: { requesterId: string },
) {
  const { projectId } = params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');

  // FIXME: missing check permissions

  const [statuses, types, issues] = await Promise.all([
    prisma.issueStatus.findMany({ where: { projectId }, orderBy: { sequence: 'asc' } }),
    prisma.issueType.findMany({ where: { projectId }, orderBy: { sequence: 'asc' } }),
    prisma.issue.findMany({
      where: { projectId },
      include: { assignee: true, reporter: true, creator: true },
    }),
  ]);

  const userIds = new Set<string>();
  issues.forEach((issue) => {
    if (issue.assigneeId) userIds.add(issue.assigneeId);
    if (issue.reporterId) userIds.add(issue.reporterId);
    if (issue.creatorId) userIds.add(issue.creatorId);
  });
  const users = await prisma.user.findMany({ where: { id: { in: Array.from(userIds) } } });

  return {
    project,
    issues: { items: issues, totalCount: issues.length },
    issueStatuses: { items: statuses, totalCount: statuses.length },
    issueTypes: { items: types, totalCount: types.length },
    users: { items: users, totalCount: users.length },
  };
}
