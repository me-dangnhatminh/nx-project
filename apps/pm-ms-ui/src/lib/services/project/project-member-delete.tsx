import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function projectMemberRemove(
  input: { memberId: string },
  context: { requesterId: string; projectId: string },
) {
  return await prisma.$transaction(
    async (tx) => {
      const { requesterId, projectId } = context;
      const { memberId } = input;

      // Kiểm tra xem người xóa có quyền ADMIN trong dự án không
      const roleActor = await tx.projectRoleActor.findFirst({
        where: { projectId, roleType: 'USER', roleParam: requesterId, projectRole: 'ADMIN' },
      });
      if (!roleActor) throw new Error('You do not have permission to remove project members');

      // Kiểm tra xem thành viên có tồn tại trong dự án không
      const memberExists = await tx.projectRoleActor.findFirst({
        where: { projectId, roleParam: memberId },
      });
      if (!memberExists)
        throw new Error(`Member with ID "${memberId}" does not exist in this project`);

      // Xóa thành viên khỏi dự án
      await tx.projectRoleActor.delete({ where: { id: memberExists.id } });

      // ============== Response ============== //
      return { data: null };
    },
    {
      isolationLevel: 'Serializable',
      timeout: 10000, // 10 seconds
      maxWait: 5000, // 5 seconds
    },
  );
}
