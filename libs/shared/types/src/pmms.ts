import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const SignUpSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignInFormData = z.infer<typeof SignInSchema>;
export type SignUpFormData = z.infer<typeof SignUpSchema>;

// User Schemas
const FirstNameSchema = z
  .string()
  .min(1, 'First name is required')
  .max(50, 'First name must be less than 50 characters');
const LastNameSchema = z
  .string()
  .min(1, 'Last name is required')
  .max(50, 'Last name must be less than 50 characters');
const EmailSchema = z.string().email('Please enter a valid email address');
const AvatarSchema = z.any();

export const UserSchema = z.object({
  id: z.string(),
  firstName: FirstNameSchema,
  lastName: LastNameSchema,
  email: EmailSchema,
  avatar: AvatarSchema.optional(),
  credential: z.string().nullish(),
  createdAt: z.string().datetime('Invalid date format for createdAt').nullish(),
  updatedAt: z.string().datetime('Invalid date format for updatedAt').nullish(),
});

// Project Schemas
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

const ProjectMemberSchema = z.object({
  id: UserSchema.shape.id,
  firstName: UserSchema.shape.firstName,
  lastName: UserSchema.shape.lastName,
  email: UserSchema.shape.email,
  avatar: UserSchema.shape.avatar.optional(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: ProjectNameSchema,
  key: ProjectKeySchema,
  description: z.string().optional(),
  type: z.enum(['software', 'business', 'service_desk'], {
    message: 'Project type must be one of: software, business, service_desk',
  }),
  lead: UserSchema.optional(),
  category: z
    .string()
    .min(1, 'Project category is required')
    .max(50, 'Project category must be less than 50 characters'),
  url: z.string().url('Please enter a valid URL').optional(),
  avatar: z.string().url('Please enter a valid avatar URL').optional(),
  createdAt: z.string().datetime('Invalid date format for createdAt'),
  updatedAt: z.string().datetime('Invalid date format for updatedAt'),
  status: z.enum(['active', 'archived'], {
    message: 'Project status must be one of: active, archived',
  }),
  members: z.array(UserSchema).optional(),
});

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  type: 'software' | 'business' | 'service_desk';
  lead: User;
  category: string;
  url?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
  members: User[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
  department?: string;
}

export interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: 'task' | 'story' | 'bug' | 'epic' | 'subtask';
  status: 'to_do' | 'in_progress' | 'in_review' | 'done';
  priority: 'highest' | 'high' | 'medium' | 'low' | 'lowest';
  assignee?: User;
  reporter: User;
  projectId: string;
  sprintId?: string;
  parentId?: string;
  storyPoints?: number;
  labels: string[];
  components: string[];
  fixVersions: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  estimatedTime?: number;
  loggedTime?: number;
  attachments: Attachment[];
  comments: Comment[];
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  projectId: string;
  issues: Issue[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  issueId: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: User;
  uploadedAt: string;
}
