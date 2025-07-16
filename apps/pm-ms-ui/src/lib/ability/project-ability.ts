import { ProjectRole } from '@prisma/client';
import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';

type CanType = 'manage' | 'read' | 'create' | 'update';
type SubjectType = 'Issue' | 'all';

export type AppAbility = MongoAbility<[CanType, SubjectType]>;
const rolePermissionMap: Record<ProjectRole, (builder: AbilityBuilder<AppAbility>) => void> = {
  ADMIN: ({ can }) => {
    can('manage', 'all');
  },
  MEMBER: ({ can }) => {
    can('read', 'Issue');
    can('create', 'Issue');
    can('update', 'Issue');
  },
  VIEWER: ({ can }) => {
    can('read', 'Issue');
  },
};

export function defineProjectAbility(role: ProjectRole): AppAbility {
  const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

  const define = rolePermissionMap[role];
  if (!define) throw new Error(`Unknown role: ${role}`);

  define(builder);
  return builder.build();
}
