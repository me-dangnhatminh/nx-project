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
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
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

//

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  avatar: z.string().optional(),
  role: z.enum(['admin', 'member', 'viewer'], {
    message: 'Role must be one of: admin, member, viewer',
  }),
  department: z.string().optional(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  key: z
    .string()
    .min(1, 'Project key is required')
    .max(20, 'Project key must be less than 20 characters'),
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
