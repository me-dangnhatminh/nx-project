import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function projectDelete(input: {
  requesterId: string;
  projectId: string;
}): Promise<void> {
  return await prisma.$transaction(
    async (tx) => {
      const { requesterId, projectId } = input;

      const roleActor = await tx.projectRoleActor.findFirst({
        where: { projectId, roleType: 'USER', roleParam: requesterId, projectRole: 'ADMIN' },
      });
      if (!roleActor) throw new Error('You do not have permission to delete this project');

      const project = await tx.project.findUnique({ where: { id: projectId } });
      if (!project) throw new Error(`Project with ID "${projectId}" does not exist`);

      await tx.projectRoleActor.deleteMany({ where: { projectId } });
      await tx.project.delete({ where: { id: projectId }, include: { permissionSchema: true } });
    },
    {
      isolationLevel: 'Serializable',
      timeout: 10000, // 10 seconds
      maxWait: 5000, // 5 seconds
    },
  );
}
