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

export default async function projectCreate(input: CreateProjectInput) {
  return await prisma.$transaction(
    async (tx) => {
      const { name, key, leadId, description, type } = input;

      // Kiểm tra xem project key đã tồn tại chưa
      const pkeyExists = await tx.project.findFirst({ select: { id: true }, where: { key } });
      if (pkeyExists) throw new Error(`Project key "${key}" already exists`);

      const leadExists = await tx.user.findFirst({ select: { id: true }, where: { id: leadId } });
      if (!leadExists) throw new Error(`Lead user with ID "${leadId}" does not exist`);

      // Tạo permission schema
      const defaultPerm = buildDefaultPermissions();
      const permissionSchema = await tx.permissionSchema.create({
        data: { name: `PS-${key}`, permissions: { create: defaultPerm } },
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
      const projectId = project.id;
      await tx.issueType.createMany({
        data: [
          { name: 'Task', color: '#4A90E2', projectId },
          { name: 'Bug', color: '#E94E77', projectId },
          { name: 'Story', color: '#F5A623', projectId },
        ],
      });

      await tx.issueStatus.createMany({
        data: [
          { name: 'To Do', color: '#F5A623', projectId },
          { name: 'In Progress', color: '#4A90E2', projectId },
          { name: 'Done', color: '#7ED321', projectId },
        ],
      });

      await tx.issuePriority.createMany({
        data: [
          { name: 'Low', color: '#7ED321', projectId },
          { name: 'Medium', color: '#F5A623', projectId },
          { name: 'High', color: '#E94E77', projectId },
        ],
      });

      // ================ Gọi Lại Project ================ //
      // Sau có thể tách thành CQRS
      const createdProject = await tx.project.findUniqueOrThrow({ where: { id: project.id } });
      return { data: createdProject };
    },
    {
      isolationLevel: 'Serializable',
      timeout: 10000, // 10 seconds
      maxWait: 5000, // 5 seconds
    },
  );
}
