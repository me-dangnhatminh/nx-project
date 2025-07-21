/* FIXME: Một số vấn đề cần lưu ý:
1. Không có trạng thái "đang chờ"
2. Chỉ check roleType: 'USER'
3. Role cứng là MEMBER, không linh hoạt
*/

import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import { InviteUserInput } from 'apps/pm-ms-ui/src/lib/schemas/project';

export default async function projectInvite(
  input: InviteUserInput,
  context: { requesterId: string; projectId: string },
) {
  return await prisma.$transaction(
    async (tx) => {
      const { requesterId, projectId } = context;
      const { inviteeId, role } = input;

      // Kiểm tra xem người mời có quyền ADMIN trong dự án không
      const roleActor = await tx.projectRoleActor.findFirst({
        where: { projectId, roleType: 'USER', roleParam: requesterId, projectRole: 'ADMIN' },
      });
      if (!roleActor) throw new Error('You do not have permission to invite users to this project');

      // Kiểm tra xem email đã được sử dụng chưa
      const existingUser = await tx.user.findUnique({ where: { id: inviteeId } });
      if (!existingUser) throw new Error(`User with ID "${inviteeId}" does not exist`);

      // Tạo lời mời (tạm thời gán mặc định tham gia luôn)
      const inviteExists = await tx.projectRoleActor.findFirst({
        where: { projectId, roleParam: inviteeId },
      });
      if (inviteExists)
        throw new Error(`User with ID "${inviteeId}" is already invited to this project`);

      // Tạo lời mời
      await tx.projectRoleActor.create({
        data: { projectId, roleType: 'USER', roleParam: existingUser.id, projectRole: role },
      });

      // ============== Response ============== //
      const user = await tx.user.findUnique({
        where: { id: existingUser.id },
        select: { id: true, email: true, firstName: true, lastName: true },
      });

      return { data: user };
    },
    {
      isolationLevel: 'Serializable',
      timeout: 10000, // 10 seconds
      maxWait: 5000, // 5 seconds
    },
  );
}
