import { z } from 'zod';

export const createStatusSchema = z.object({
  name: z.string().min(1, 'Status name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  sequence: z.number().optional(),
});

export const updateStatusSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  sequence: z.number().optional(),
});

export const statusQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().min(1).max(100)),
});

export type CreateStatusInput = z.infer<typeof createStatusSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type StatusQueryInput = z.infer<typeof statusQuerySchema>;
