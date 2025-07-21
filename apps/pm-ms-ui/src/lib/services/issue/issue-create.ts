import z from 'zod';
import { CreateIssueInput } from 'apps/pm-ms-ui/src/lib/schemas/issue';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import lexorank from 'apps/pm-ms-ui/src/lib/utils/lexorank';

const IntoSchema = z.object({ before: z.string().optional(), after: z.string().optional() });
type IntoSchema = z.infer<typeof IntoSchema>;

export default async function issueCreate(
  input: { issue: CreateIssueInput; into?: IntoSchema },
  context: { requesterId: string; projectId: string },
) {
  return prisma.$transaction(
    async (tx) => {
      const issueInput = input.issue;
      const projectId = context.projectId;

      // Validation logic...
      if (issueInput.assigneeId) {
        const exits = await tx.user.findUnique({ where: { id: issueInput.assigneeId } });
        if (!exits) throw new Error('Assignee does not exist in project');
      }

      if (issueInput.reporterId) {
        const exits = await tx.user.findUnique({ where: { id: issueInput.reporterId } });
        if (!exits) throw new Error('Reporter does not exist in project');
      }

      const project = await tx.project.findUnique({ where: { id: projectId } });
      if (!project) throw new Error('Project does not exist');

      // ✅ Tính toán rank dựa trên vị trí mong muốn
      let newRank: string;

      if (input.into?.before && input.into?.after) {
        // Đặt giữa hai issue
        newRank = lexorank.between(input.into.after, input.into.before);
      } else if (input.into?.before) {
        // Đặt trước một issue cụ thể
        const beforeIssue = await tx.issue.findFirst({
          where: { projectId, rank: { lt: input.into.before } },
          orderBy: { rank: 'desc' },
          select: { rank: true },
        });

        if (beforeIssue) {
          newRank = lexorank.between(beforeIssue.rank, input.into.before);
        } else {
          // Không có issue nào trước đó, tạo rank trước issue đích
          newRank = lexorank.between(lexorank.min(), input.into.before);
        }
      } else if (input.into?.after) {
        // Đặt sau một issue cụ thể
        const afterIssue = await tx.issue.findFirst({
          where: { projectId, rank: { gt: input.into.after } },
          orderBy: { rank: 'asc' },
          select: { rank: true },
        });

        if (afterIssue) {
          newRank = lexorank.between(input.into.after, afterIssue.rank);
        } else {
          // Không có issue nào sau đó, tạo rank sau issue đích
          newRank = lexorank.between(input.into.after, lexorank.max());
        }
      } else {
        // Không chỉ định vị trí, thêm vào cuối danh sách
        const lastIssue = await tx.issue.findFirst({
          where: { projectId },
          orderBy: { rank: 'desc' },
          select: { rank: true },
        });

        if (lastIssue) {
          newRank = lexorank.between(lastIssue.rank, lexorank.max());
        } else {
          // Đây là issue đầu tiên trong project
          newRank = lexorank.middle();
        }
      }

      // Validation...
      const [statuses] = await Promise.all([
        tx.issueStatus.findMany({ where: { projectId }, select: { id: true } }),
      ]);

      if (!statuses.some((s) => s.id === issueInput.statusId)) {
        throw new Error('Issue status does not exist in project');
      }

      // FIXME === create default type and priority if not exists
      await tx.issueType.upsert({
        where: { id: 'Default Type' },
        create: { id: 'Default Type', name: 'Default Type', projectId },
        update: {},
      });

      await tx.issuePriority.upsert({
        where: { id: 'Default Priority' },
        create: { id: 'Default Priority', name: 'Default Priority', projectId },
        update: {},
      });
      // ============================================================

      // ✅ Tạo issue với rank là string
      const issue = await tx.issue.create({
        data: {
          key: issueInput.key,
          summary: issueInput.summary,
          description: issueInput.description,
          typeId: 'Default Type', // FIXME:
          priorityId: 'Default Priority', // FIXME:
          statusId: issueInput.statusId,
          projectId: projectId, // Sửa từ issueInput.projectId
          reporterId: issueInput.reporterId,
          assigneeId: issueInput.assigneeId,
          dueDate: issueInput.dueDate ? new Date(issueInput.dueDate) : null,
          resolutionId: issueInput.resolutionId,
          creatorId: context.requesterId,
          rank: newRank, // ✅ Đây là string, không phải LexoRank object
        },
      });

      return issue;
    },
    { isolationLevel: 'Serializable' },
  );
}
