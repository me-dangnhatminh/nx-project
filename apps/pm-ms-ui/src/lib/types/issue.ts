import { z } from 'zod';

export const createIssueSchema = z.object({
  key: z.string().min(1, 'Issue key is required'),
  summary: z.string().min(1, 'Summary is required'),
  description: z.string().optional(),
  typeId: z.string().min(1, 'Issue type is required'),
  statusId: z.string().min(1, 'Status is required'),
  priorityId: z.string().min(1, 'Priority is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  reporterId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  resolutionId: z.string().optional(),
});

export const updateIssueSchema = z.object({
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
export const issueQuerySchema = z.object({
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

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type IssueQueryInput = z.infer<typeof issueQuerySchema>;
