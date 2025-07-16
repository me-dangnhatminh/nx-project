import { z } from 'zod';

const StatusColorSchema = z
  .string()
  .regex(
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
    'Invalid color format. Use hex format (#RRGGBB or #RGB)',
  );

const StatusNameSchema = z
  .string()
  .min(1, 'Status name is required')
  .max(50, 'Status name must be less than 50 characters');

const StatusSequenceSchema = z
  .number()
  .int()
  .min(0, 'Sequence must be a non-negative integer')
  .max(1000, 'Sequence must be less than or equal to 1000');

export const CreateStatusSchema = z.object({
  name: StatusNameSchema,
  description: z.string().optional(),
  color: StatusColorSchema.optional(),
  sequence: StatusSequenceSchema.optional(),
});

export const UpdateStatusSchema = z.object({
  name: StatusNameSchema.optional(),
  description: z.string().optional(),
  color: StatusColorSchema.optional(),
  sequence: StatusSequenceSchema.optional(),
});

export const StatusQuerySchema = z.object({
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

export const ReorderStatusSchema = z.object({
  status: z.object({ id: z.string(), sequence: z.number() }),
});

export type CreateStatusInput = z.infer<typeof CreateStatusSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;
export type StatusQueryInput = z.infer<typeof StatusQuerySchema>;
export type ReorderStatusInput = z.infer<typeof ReorderStatusSchema>;
