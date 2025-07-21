import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import { UpdateProjectMemberInput } from 'apps/pm-ms-ui/src/lib/schemas/project';

export default async function projectMemberUpdate(
  input: UpdateProjectMemberInput,
  context: { requesterId: string; projectId: string },
) {
  return await prisma.$transaction(
    async (tx) => {
      const { requesterId, projectId } = context;
      const { memberId, role } = input;

      // Kiểm tra xem người cập nhật có quyền ADMIN trong dự án không
      const roleActor = await tx.projectRoleActor.findFirst({
        where: { projectId, roleType: 'USER', roleParam: requesterId, projectRole: 'ADMIN' },
      });
      if (!roleActor) throw new Error('You do not have permission to update project members');

      // Kiểm tra xem thành viên có tồn tại trong dự án không
      const memberExists = await tx.projectRoleActor.findFirst({
        where: { projectId, roleParam: memberId },
      });
      if (!memberExists)
        throw new Error(`Member with ID "${memberId}" does not exist in this project`);

      // Cập nhật vai trò của thành viên
      await tx.projectRoleActor.update({
        where: { id: memberExists.id },
        data: { projectRole: role },
      });

      // ============== Response ============== //
      const updatedMember = await tx.user.findUnique({
        where: { id: memberId },
        select: { id: true, email: true, firstName: true, lastName: true },
      });

      return { data: updatedMember };
    },
    {
      isolationLevel: 'Serializable',
      timeout: 10000, // 10 seconds
      maxWait: 5000, // 5 seconds
    },
  );
}
