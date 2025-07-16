import { ProjectRole, SchemaPermission } from '@prisma/client';
import { CreateProjectInput } from 'apps/pm-ms-ui/src/lib/schemas/project';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

const buildDefaultPermissions = (): Omit<SchemaPermission, 'id' | 'schemaId'>[] => {
  return [
    // ADMIN - toàn quyền
    { permission: 'BROWSE_PROJECTS', permType: 'PROJECT_ROLE', permParam: ProjectRole.ADMIN },
    { permission: 'ADMIN_PROJECTS', permType: 'PROJECT_ROLE', permParam: ProjectRole.ADMIN },
    { permission: 'EDIT_ISSUES', permType: 'PROJECT_ROLE', permParam: ProjectRole.ADMIN },
    { permission: 'CREATE_ISSUES', permType: 'PROJECT_ROLE', permParam: ProjectRole.ADMIN },
    { permission: 'ASSIGN_ISSUES', permType: 'PROJECT_ROLE', permParam: ProjectRole.ADMIN },
    { permission: 'RESOLVE_ISSUES', permType: 'PROJECT_ROLE', permParam: ProjectRole.ADMIN },

    // MEMBER - thao tác giới hạn
    { permission: 'BROWSE_PROJECTS', permType: 'PROJECT_ROLE', permParam: ProjectRole.MEMBER },
    { permission: 'EDIT_ISSUES', permType: 'PROJECT_ROLE', permParam: ProjectRole.MEMBER },
    { permission: 'CREATE_ISSUES', permType: 'PROJECT_ROLE', permParam: ProjectRole.MEMBER },
    { permission: 'ASSIGN_ISSUES', permType: 'PROJECT_ROLE', permParam: ProjectRole.MEMBER },

    // VIEWER - chỉ được xem
    { permission: 'BROWSE_PROJECTS', permType: 'PROJECT_ROLE', permParam: ProjectRole.VIEWER },
  ];
};

export default async function projectCreate(input: CreateProjectInput): Promise<void> {
  return await prisma.$transaction(
    async (tx) => {
      const { name, key, leadId, description = '', type = 'SOFTWARE' } = input;

      // Kiểm tra xem project key đã tồn tại chưa
      const pkeyExists = await tx.project.findFirst({ select: { id: true }, where: { key } });
      if (pkeyExists) throw new Error(`Project key "${key}" already exists`);

      const leadExists = await tx.user.findFirst({ select: { id: true }, where: { id: leadId } });
      if (!leadExists) throw new Error(`Lead user with ID "${leadId}" does not exist`);

      // Tạo permission schema
      const defaultPerm = buildDefaultPermissions();
      const permissionSchema = await tx.permissionSchema.create({
        data: { name: `PermissionSchema-${key}`, permissions: { create: defaultPerm } },
      });

      // Tạo Project
      const permissionSchemaId = permissionSchema.id;
      const project = await tx.project.create({
        data: { name, key, leadId, description, type, permissionSchemaId },
      });

      // Gán lead vào bảng projectRoleActor
      await tx.projectRoleActor.create({
        data: { projectId: project.id, roleType: 'USER', roleParam: leadId, projectRole: 'ADMIN' },
      });

      // Thiết lập các default khác như issue types, statuses, v.v. nếu cần
    },
    {
      isolationLevel: 'Serializable',
      timeout: 10000, // 10 seconds
      maxWait: 5000, // 5 seconds
    },
  );
}
