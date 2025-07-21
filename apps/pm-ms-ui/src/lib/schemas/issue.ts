import { z } from 'zod';

export const IssueTypeSchema = z.object({
  id: z.string(),
  sequence: z.number(),
  description: z.string().optional(),
  iconURL: z.string().optional(),
  avatarId: z.string().optional(),
});

export const CreateIssueSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  summary: z.string().min(1, 'Summary is required'),
  description: z.string().optional(),
  statusId: z.string().min(1, 'Status ID is required'),
  typeId: z.string().min(1, 'Type ID is required').optional(),
  priorityId: z.string().min(1, 'Priority ID is required').optional(),
  resolutionId: z.string().optional(),
  reporterId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const UpdateIssueSchema = z.object({
  key: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  typeId: z.string().optional(),
  statusId: z.string().optional(),
  priorityId: z.string().optional(),
  reporterId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  resolutionId: z.string().optional(),
  archived: z.boolean().optional(),
});

export const ReorderIssueSchema = z.object({
  source: z.object({ ids: z.string().array().min(1, 'At least one source issue ID is required') }),
  dest: z.object({
    statusId: z.string().optional(),
    destType: z.enum(['before', 'after']).optional(),
    destParam: z.string().optional(),
  }),
});

export type ReorderIssueInput = z.infer<typeof ReorderIssueSchema>;

export const SourceIssueSchema = z.object({ id: z.string().min(1, 'Issue ID is required') });
export const DestinationSchema = z
  .object({ statusId: z.string() })
  .or(
    z.object({
      destType: z.enum(['before', 'after']),
      destParam: z.string().min(1, 'Destination parameter is required'),
    }),
  )
  .or(
    z.object({
      statusId: z.string(),
      destType: z.enum(['before', 'after']),
      destParam: z.string().min(1, 'Destination parameter is required'),
    }),
  );

export const IssueReorderSchema = z.object({
  source: SourceIssueSchema.array().min(1, 'At least one source issue is required'),
  dest: DestinationSchema,
  projectId: z.string().min(1, 'Project ID is required'),
});

export type IssueReorderInput = z.infer<typeof IssueReorderSchema>;

// Fix: Transform string values to appropriate types for query params
export const IssueQuerySchema = z.object({
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  reporterId: z.string().optional(),
  statusId: z.string().optional(),
  typeId: z.string().optional(),
  priorityId: z.string().optional(),
  // Transform string to boolean for URL params
  archived: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return undefined;
      return val === 'true' || val === '1';
    })
    .or(z.boolean().optional()),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().min(1).max(100)),
  search: z.string().optional(),
});

export type CreateIssueInput = z.infer<typeof CreateIssueSchema>;
export type UpdateIssueInput = z.infer<typeof UpdateIssueSchema>;
export type IssueQueryInput = z.infer<typeof IssueQuerySchema>;
