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
        select: {
          id: true,
          name: true,
          key: true,
          avatarId: true,
          leadId: true,
          permissionSchema: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Check permissions for each project
      const projectPermissions = await tx.schemaPermission.findMany({
        where: {
          schemaId: { in: projects.map((p) => p.permissionSchema.id) },
          permType: 'PROJECT_ROLE',
          permParam: { in: projectIds },
        },
        select: { permission: true, permParam: true },
      });

      const leadIds = projects.map((project) => project.leadId);
      const leads = await tx.user.findMany({
        where: { id: { in: leadIds } },
        select: { id: true, firstName: true, lastName: true, avatarId: true },
      });
      const leadMap = new Map(leads.map((lead) => [lead.id, lead]));
      const projectData: ProjectDataRes[] = projects.map((project) => {
        const lead = leadMap.get(project.leadId);
        return {
          id: project.id,
          name: project.name,
          key: project.key,
          avatar: project.avatarId
            ? { id: project.avatarId, url: `/api/v2/avatars/${project.avatarId}` }
            : { id: '', url: '' },
          lead: {
            id: lead?.id || '',
            name: `${lead?.firstName || ''} ${lead?.lastName || ''}`.trim(),
            picture: lead?.avatarId ? `/api/v2/avatars/${lead.avatarId}` : undefined,
          },
        };
      });
      return {
        items: projectData,
        total: projectData.length,
      };
    },
    { isolationLevel: 'ReadUncommitted', timeout: 10000, maxWait: 5000 },
  );
}
