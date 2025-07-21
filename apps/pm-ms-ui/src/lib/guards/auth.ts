import { PermissionKey } from '@prisma/client';
import {
  hasProjectPermission,
  isProjectMember,
  isProjectAdmin,
} from 'apps/pm-ms-ui/src/lib/services/permission';
import { AuthContext } from '../utils/auth';

export interface AuthorizationOptions {
  requireAuth?: boolean;
  requireProjectMember?: boolean;
  requireProjectAdmin?: boolean;
  requirePermission?: PermissionKey;
  allowSelf?: boolean;
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public code: string = 'UNAUTHORIZED',
    public statusCode: number = 403,
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export async function checkAuthorization(
  authContext: AuthContext | null,
  projectId: string,
  options: AuthorizationOptions,
  targetUserId?: string,
): Promise<void> {
  // Check authentication
  if (options.requireAuth && !authContext) {
    throw new AuthorizationError('Authentication required', 'UNAUTHENTICATED', 401);
  }

  if (!authContext) return;
  const userId = authContext.user.userId;

  // Allow self access
  if (options.allowSelf && targetUserId && userId === targetUserId) return;

  // Check project membership
  if (options.requireProjectMember) {
    const isMember = await isProjectMember(userId, projectId);
    if (!isMember) {
      throw new AuthorizationError('Project membership required', 'NOT_PROJECT_MEMBER');
    }
  }

  // Check project admin
  if (options.requireProjectAdmin) {
    const isAdmin = await isProjectAdmin(userId, projectId);
    if (!isAdmin) {
      throw new AuthorizationError('Project admin role required', 'NOT_PROJECT_ADMIN');
    }
  }

  // Check specific permission
  if (options.requirePermission) {
    const hasPermission = await hasProjectPermission(userId, projectId, options.requirePermission);
    if (!hasPermission) {
      throw new AuthorizationError(
        `Permission ${options.requirePermission} required`,
        'INSUFFICIENT_PERMISSIONS',
      );
    }
  }
}
