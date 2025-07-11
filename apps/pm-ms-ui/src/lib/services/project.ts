import { ProjectCreateInput } from 'apps/pm-ms-ui/src/lib/api/v2.project';
import { prisma } from '../prisma';

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

const listProjects = async (params: { requesterId: string }) => {
  const userId = params.requesterId;

  const roleActors = await prisma.projectRoleActor.findMany({
    where: { roleType: 'USER', roleParam: userId },
    select: { projectId: true },
  });

  const projectIds = roleActors.map((ra) => ra.projectId);

  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: {
      id: true,
      name: true,
      url: true,
      key: true,
      leadId: true,
      description: true,
      type: true,
      category: true,
      avatarId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const leadIds = projects.map((project) => project.leadId);
  const leads = await prisma.user.findMany({
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
};

const createProject = async (data: ProjectCreateInput) => {
  const { name, key, leadId, description = '', type = 'software', category = '' } = data;

  // Step 1: Tạo permission schema riêng cho project
  const permissionSchema = await prisma.permissionSchema.create({
    data: {
      name: `PermissionSchema-${key}`,
      permissions: {
        create: [
          {
            permission: 'ADMIN_PROJECTS',
            permType: 'user',
            permParam: leadId,
          },
          {
            permission: 'BROWSE_PROJECTS',
            permType: 'user',
            permParam: leadId,
          },
        ],
      },
    },
  });

  // Step 2: Tạo Project
  const project = await prisma.project.create({
    data: {
      name,
      key,
      leadId,
      description,
      type,
      category,
      permissionSchemaId: permissionSchema.id,
    },
  });

  // Step 3: Gán lead vào bảng projectRoleActor (nếu dùng)
  await prisma.projectRoleActor.create({
    data: {
      projectId: project.id,
      roleType: 'USER',
      roleParam: leadId,
      projectRole: 'ADMIN',
    },
  });

  return project;
};

export const projectServices = {
  createProject,
  listProjects,
};
