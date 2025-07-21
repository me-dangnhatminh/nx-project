import z from 'zod';

const ProjectNameSchema = z
  .string()
  .min(1, 'Project name is required')
  .max(100, 'Project name must be less than 100 characters');

const ProjectKeySchema = z
  .string()
  .min(1, 'Project key is required')
  .max(20, 'Project key must be less than 20 characters')
  .regex(
    /^[A-Z0-9_-]+$/,
    'Project key must contain only uppercase letters, numbers, underscores, and hyphens',
  );

const ProjectTypeSchema = z.enum(['SOFTWARE', 'MARKETING', 'RESEARCH', 'DESIGN', 'OTHER']);

const ProjectAvatarSchema = z.any();

export const CreateProjectSchema = z.object({
  name: ProjectNameSchema,
  url: z.string().url('Invalid URL format').optional(),
  key: ProjectKeySchema,
  leadId: z.string().min(1, 'Lead ID is required'),
  description: z.string().optional(),
  type: ProjectTypeSchema,
  avatar: ProjectAvatarSchema.optional(),
});

export const UpdateProjectSchema = z.object({
  name: CreateProjectSchema.shape.name.nullish(),
  key: CreateProjectSchema.shape.key.nullish(),
  description: CreateProjectSchema.shape.description.nullish(),
  type: CreateProjectSchema.shape.type.nullish(),
  url: CreateProjectSchema.shape.url.nullish(),
  avatar: CreateProjectSchema.shape.avatar.nullish(),
});

export const InviteUserSchema = z.object({
  inviteeId: z.string().min(1, 'Invitee ID is required'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

export const InviteProjectMemberSchema = z.object({
  inviteeId: z.string().min(1, 'Invitee ID is required'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

export const UpdateProjectMemberSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type InviteUserInput = z.infer<typeof InviteUserSchema>;
export type InviteProjectMemberInput = z.infer<typeof InviteProjectMemberSchema>;
export type UpdateProjectMemberInput = z.infer<typeof UpdateProjectMemberSchema>;
