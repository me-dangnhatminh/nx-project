import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

// TODO: fomart này triển khai trong tương lai
// type ProjectDataRes = {
//   data: {
//     leads: { items: any[]; total: number };
//     projects: { items: any[]; total: number };
//     projectAvatars: { items: any[]; total: number };
//     permissions: { items: any[]; total: number };
//   };
// };

type ProjectDataRes = {
  id: string;
  name: string;
  key: string;
  avatar: { id: string; url: string };
  lead: { id: string; name: string; picture?: string };
};

export type ProjectListRes = {
  items: ProjectDataRes[];
  total: number;
};

export default async function projectList(params: { requesterId: string }) {
  return prisma.$transaction(
    async (tx) => {
      const userId = params.requesterId;

      const roleActors = await tx.projectRoleActor.findMany({
        where: { roleParam: userId },
        select: { projectId: true },
      });

      const projectIds = roleActors.map((ra) => ra.projectId);
      const projects = await tx.project.findMany({
        where: { id: { in: projectIds } },
        orderBy: { createdAt: 'desc' },
      });

      return {
        items: projects,
        total: projects.length,
      };
    },
    { isolationLevel: 'ReadUncommitted', timeout: 10000, maxWait: 5000 },
  );
}
