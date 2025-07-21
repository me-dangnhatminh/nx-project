import { ProjectRole, PermissionKey, ActorType } from '@prisma/client';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import {
  hasProjectPermission,
  getUserProjectPermissions,
} from 'apps/pm-ms-ui/src/lib/services/permission';

export interface ProjectMember {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: { id: string; fileName: string; url: string };
  };
  role: ProjectRole;
  permissions: Permission[];
  joinedAt: string;
  isActive: boolean;
}

export interface Permission {
  key: PermissionKey;
  granted: boolean;
  source: PermissionSource;
}

export interface PermissionSource {
  type: 'ROLE' | 'DIRECT' | 'SCHEMA';
  id: string;
  name: string;
}

export interface GetProjectMembersOptions {
  page?: number;
  limit?: number;
  role?: ProjectRole;
  search?: string;
  includePermissions?: boolean;
  includeInactive?: boolean;
}

export interface GetProjectMembersResponse {
  members: ProjectMember[];
  roles: ProjectRoleInfo[];
  meta: {
    total: number;
    activeCount: number;
    roleDistribution: Record<ProjectRole, number>;
    pagination: PaginationMeta;
  };
}

export interface ProjectRoleInfo {
  role: ProjectRole;
  name: string;
  description: string;
  memberCount: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function buildWhereConditions(
  projectId: string,
  filters: {
    role?: ProjectRole;
    search?: string;
    includeInactive?: boolean;
  },
) {
  const where: any = {
    projectId,
    roleType: ActorType.USER,
  };

  if (filters.role) {
    where.projectRole = filters.role;
  }

  return where;
}

async function getUserPermissionsForProject(
  userId: string,
  projectId: string,
): Promise<Permission[]> {
  const permissions = await getUserProjectPermissions(userId, projectId);

  return permissions.map((permission) => ({
    key: permission,
    granted: true,
    source: {
      type: 'ROLE' as const,
      id: 'PROJECT_ROLE',
      name: 'Project Role',
    },
  }));
}

function mapToProjectMember(
  roleActor: any,
  user: any,
  permissions: Permission[],
  options: { showSensitiveData: boolean } = { showSensitiveData: true },
): ProjectMember {
  return {
    id: `${roleActor.projectId}-${user.id}`,
    user: {
      id: user.id,
      email: options.showSensitiveData ? user.email : '***@***.***',
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar
        ? {
            id: user.avatar.id,
            fileName: user.avatar.fileName,
            url: `/api/images/${user.avatar.id}`,
          }
        : undefined,
    },
    role: roleActor.projectRole,
    permissions: options.showSensitiveData ? permissions : [],
    joinedAt: roleActor.createdAt?.toISOString() || new Date().toISOString(),
    isActive: true,
  };
}

async function getRoleDistribution(projectId: string): Promise<Record<ProjectRole, number>> {
  const distribution = await prisma.projectRoleActor.groupBy({
    by: ['projectRole'],
    where: {
      projectId,
      roleType: ActorType.USER,
    },
    _count: {
      projectRole: true,
    },
  });

  const result: Record<ProjectRole, number> = {
    ADMIN: 0,
    MEMBER: 0,
    VIEWER: 0,
  };

  distribution.forEach((item) => {
    result[item.projectRole] = item._count.projectRole;
  });

  return result;
}

function getProjectRoleDefinitions(
  roleDistribution: Record<ProjectRole, number>,
): ProjectRoleInfo[] {
  return [
    {
      role: ProjectRole.ADMIN,
      name: 'Administrator',
      description: 'Full access to project settings and all features',
      memberCount: roleDistribution.ADMIN,
    },
    {
      role: ProjectRole.MEMBER,
      name: 'Member',
      description: 'Can create and edit issues, participate in project',
      memberCount: roleDistribution.MEMBER,
    },
    {
      role: ProjectRole.VIEWER,
      name: 'Viewer',
      description: 'Read-only access to project content',
      memberCount: roleDistribution.VIEWER,
    },
  ];
}

export async function getProjectMembers(
  projectId: string,
  options: GetProjectMembersOptions = {},
  requesterId?: string,
): Promise<GetProjectMembersResponse> {
  const {
    page = 1,
    limit = 10,
    role,
    search,
    includePermissions = true,
    includeInactive = false,
  } = options;

  // Build where conditions
  const whereConditions = buildWhereConditions(projectId, { role, search, includeInactive });

  // Get total count
  const total = await prisma.projectRoleActor.count({ where: whereConditions });

  // Get members with pagination
  const roleActors = await prisma.projectRoleActor.findMany({
    where: whereConditions,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: [{ projectRole: 'asc' }, { roleParam: 'asc' }],
  });

  // Get user details
  const userIds = roleActors.map((ra) => ra.roleParam);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: { avatar: true },
  });

  // Check if requester can see detailed permissions
  const canSeePermissions = requesterId
    ? await hasProjectPermission(requesterId, projectId, PermissionKey.ADMIN_PROJECTS)
    : false;

  // Map to response format
  const members = await Promise.all(
    roleActors.map(async (roleActor) => {
      const user = users.find((u) => u.id === roleActor.roleParam);
      if (!user) return null;

      const permissions =
        includePermissions && canSeePermissions
          ? await getUserPermissionsForProject(user.id, projectId)
          : [];

      return mapToProjectMember(roleActor, user, permissions, {
        showSensitiveData: canSeePermissions,
      });
    }),
  );

  // Filter out null values
  const validMembers = members.filter(Boolean) as ProjectMember[];

  // Get role distribution
  const roleDistribution = await getRoleDistribution(projectId);

  // Get role definitions
  const roles = getProjectRoleDefinitions(roleDistribution);

  return {
    members: validMembers,
    roles,
    meta: {
      total,
      activeCount: validMembers.filter((m) => m.isActive).length,
      roleDistribution,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  };
}

export async function searchUsers(search: string, excludeUserIds: string[] = []): Promise<any[]> {
  return prisma.user.findMany({
    where: {
      AND: [
        {
          id: {
            notIn: excludeUserIds,
          },
        },
        {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
      ],
    },
    include: {
      avatar: true,
    },
    take: 10,
  });
}
