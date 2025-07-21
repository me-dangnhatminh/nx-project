import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import { PermissionKey, ProjectRole, ActorType, PermissionType } from '@prisma/client';

export const getUserProjectRole = async (userId: string, projectId: string) => {
  const roleActor = await prisma.projectRoleActor.findFirst({
    where: { projectId, roleParam: userId, roleType: ActorType.USER },
  });

  return roleActor?.projectRole || null;
};

export async function hasProjectPermission(
  userId: string,
  projectId: string,
  permission: PermissionKey,
): Promise<boolean> {
  try {
    const userRole = await getUserProjectRole(userId, projectId);
    if (!userRole) return false;

    // Get project's permission schema
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { permissionSchema: { include: { permissions: true } } },
    });

    if (!project) return false;
    return project.permissionSchema.permissions.some(
      (p) =>
        p.permission === permission &&
        p.permType === PermissionType.PROJECT_ROLE &&
        p.permParam === userRole,
    );
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

export async function isProjectMember(userId: string, projectId: string): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);
  return role !== null;
}

export async function isProjectAdmin(userId: string, projectId: string): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);
  return role === ProjectRole.ADMIN;
}

export async function isProjectViewer(userId: string, projectId: string): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);
  return role === ProjectRole.VIEWER;
}

export async function getUserProjectPermissions(
  userId: string,
  projectId: string,
): Promise<{ permissions: { [key: string]: { id: string; key: string; granted: boolean } } }> {
  const userRole = await getUserProjectRole(userId, projectId);
  if (!userRole) return { permissions: {} };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { permissionSchema: { include: { permissions: true } } },
  });

  if (!project) return { permissions: {} };
  const permissions = new Map<string, { id: string; key: string; granted: boolean }>();
  project.permissionSchema.permissions.forEach((p) => {
    if (p.permType === PermissionType.PROJECT_ROLE && p.permParam === userRole) {
      permissions.set(p.permission, { id: p.id, key: p.permission, granted: true });
    }
  });

  return { permissions: Object.fromEntries(permissions) };
}

export async function projectPermissionList(
  userId: string,
  projectId: string,
): Promise<PermissionKey[]> {
  const userRole = await getUserProjectRole(userId, projectId);
  if (!userRole) return [];
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { permissionSchema: { include: { permissions: true } } },
  });

  if (!project) return [];

  return project.permissionSchema.permissions
    .filter((p) => p.permType === 'PROJECT_ROLE' && p.permParam === userRole)
    .map((p) => p.permission);
}
