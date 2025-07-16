import { z } from 'zod';

export const IssueTypeSchema = z.object({
  id: z.string(),
  sequence: z.number(),
  description: z.string().optional(),
  iconURL: z.string().optional(),
  avatarId: z.string().optional(),
});

const IssueKeySchema = z
  .string()
  .min(1, 'Key is required')
  .max(20, 'Key must be less than 20 characters');
const IssueSummarySchema = z
  .string()
  .min(1, 'Summary is required')
  .max(200, 'Summary must be less than 200 characters');

export const CreateIssueSchema = z.object({
  key: IssueKeySchema,
  summary: IssueSummarySchema,
  description: z.string().optional(),
  typeId: z.string().min(1, 'Type ID is required'),
  statusId: z.string().min(1, 'Status ID is required'),
  priorityId: z.string().min(1, 'Priority ID is required'),
  reporterId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  resolutionId: z.string().optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  archived: z.boolean().optional(),
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
