import { axiosInstance } from './_base';
import z from 'zod';
export const AvatarSchema = z
  .instanceof(File)
  .refine((file) => file.type.startsWith('image/'), { message: 'Avatar must be an image file' })
  .refine((file) => file.size <= 2 * 1024 * 1024, { message: 'Avatar must be less than 2MB' });

export const ProjectTypeSchema = z.enum(['software', 'business', 'service_desk'], {
  errorMap: () => ({ message: 'Invalid project type' }),
});

export const ProjectKeySchema = z
  .string()
  .min(1, 'Project key is required')
  .regex(/^[A-Z][A-Z0-9_]*$/, {
    message: `Project key must start with an uppercase letter and can only contain uppercase letters, numbers, and underscores`,
  });

export const ProjectCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  url: z.string().url('Invalid URL format').optional(),
  key: ProjectKeySchema,
  leadId: z.string().min(1, 'Lead ID is required'),
  description: z.string().optional(),
  type: ProjectTypeSchema,
  category: z.string().min(1, 'Project category is required'),
  avatar: AvatarSchema.optional(),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
const createProject = async (data: ProjectCreateInput) => {
  // form data
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (value instanceof File) formData.append(key, value);
      else formData.append(key, String(value));
    }
  });

  const response = await axiosInstance.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const getDetailProject = async (id: string) => {
  const response = await axiosInstance.get(`/projects/${id}`);
  return response.data;
};

const listProjects = async (params: { page?: number; pageSize?: number; search?: string } = {}) => {
  const response = await axiosInstance.get('/projects', { params });
  return response.data;
};

export const projectApi = {
  get: getDetailProject,
  create: createProject,
  list: listProjects,
};
