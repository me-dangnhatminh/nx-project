import { ProjectRole } from '@prisma/client';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

type ProjectMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: ProjectRole;
  // permissions?: string[];
};

export default async function qProjectMemberList(
  projectId: string,
  { requesterId }: { requesterId: string },
) {
  //   const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  //   const reqter = await prisma.user.findUniqueOrThrow({ where: { id: requesterId } });

  //   // check requester permission
  //   //

  //   const permSchemaId = project.permissionSchemaId;
  //   const permSchema = await prisma.permissionSchema.findUniqueOrThrow({
  //     where: { id: permSchemaId },
  //     include: { permissions: true },
  //   });

  //   //
  const roleActors = await prisma.projectRoleActor.findMany({
    where: { projectId, roleType: 'USER' },
    orderBy: { projectRole: 'asc', roleParam: 'asc' },
  });

  const userIds = roleActors.map((ra) => ra.roleParam);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  const members = await Promise.all(
    roleActors.map(async (roleActor) => {
      const user = users.find((u) => u.id === roleActor.roleParam);
      if (!user) return null;

      const permissions = includePermissions
        ? await this.getUserPermissionsForProject(user.id, projectId)
        : [];

      return this.mapToProjectMember(roleActor, user, permissions);
    }),
  );
}
