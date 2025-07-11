'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectsApi } from '../../../lib/api/projects';
import { Button } from '@shadcn-ui/components/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shadcn-ui/components/form';
import { Input } from '@shadcn-ui/components/input';
import { Textarea } from '@shadcn-ui/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn-ui/components/select';
import { Card, CardContent } from '@shadcn-ui/components/card';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '@shared/types/pmms';

// Form schema for editing projects
const EditProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  key: z
    .string()
    .min(1, 'Project key is required')
    .max(20, 'Project key must be less than 20 characters')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Project key must contain only uppercase letters, numbers, underscores, and hyphens',
    ),
  description: z.string().optional(),
  type: z.enum(['software', 'business', 'service_desk'], {
    message: 'Project type must be one of: software, business, service_desk',
  }),
  category: z
    .string()
    .min(1, 'Project category is required')
    .max(50, 'Project category must be less than 50 characters'),
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  avatar: z.string().url('Please enter a valid avatar URL').optional().or(z.literal('')),
  status: z.enum(['active', 'archived'], {
    message: 'Project status must be one of: active, archived',
  }),
});

type EditProjectFormData = z.infer<typeof EditProjectSchema>;

interface EditProjectFormProps {
  project: Project;
  onSuccess?: (project: Project) => void;
  onCancel?: () => void;
}

export default function EditProjectForm({ project, onSuccess, onCancel }: EditProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(EditProjectSchema),
    defaultValues: {
      name: project.name,
      key: project.key,
      description: project.description || '',
      type: project.type as 'software' | 'business' | 'service_desk',
      category: project.category,
      url: project.url || '',
      avatar: project.avatar || '',
      status: project.status as 'active' | 'archived',
    },
  });

  const onSubmit = async (data: EditProjectFormData) => {
    setIsSubmitting(true);

    try {
      console.log('Form data before API call:', data);

      // Remove empty optional fields and prepare data
      const cleanData = {
        name: data.name,
        key: data.key,
        description: data.description === '' ? undefined : data.description,
        type: data.type,
        category: data.category,
        url: data.url === '' ? undefined : data.url,
        avatar: data.avatar === '' ? undefined : data.avatar,
        status: data.status,
      };

      console.log('Clean data being sent to API:', cleanData);

      const response = await projectsApi.updateProject(project.id, cleanData);

      console.log('API Response:', response);

      onSuccess?.(response);
      toast.success('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);

      if (error.response?.data?.error === 'Validation error') {
        const details = error.response.data.details;
        const errorMessages = details
          .map((detail) => `${detail.path.join('.')}: ${detail.message}`)
          .join(', ');
        toast.error(`Validation Error: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update project');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardContent className='p-6'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Project Name */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter project name' {...field} />
                    </FormControl>
                    <FormDescription>The name of your project (max 100 characters)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Key */}
              <FormField
                control={form.control}
                name='key'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Key *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='PROJECT_KEY'
                        {...field}
                        onChange={(e) => {
                          const upperValue = e.target.value.toUpperCase();
                          field.onChange(upperValue);
                        }}
                      />
                    </FormControl>
                    <FormDescription>Unique identifier (A-Z, 0-9, _, -)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Type */}
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select project type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='software'>Software</SelectItem>
                        <SelectItem value='business'>Business</SelectItem>
                        <SelectItem value='service_desk'>Service Desk</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose the type of project</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Status */}
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='archived'>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Project status</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Web Development, Mobile App, Marketing'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Project category (max 50 characters)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe your project...'
                        className='resize-none'
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional project description</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project URL */}
              <FormField
                control={form.control}
                name='url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project URL</FormLabel>
                    <FormControl>
                      <Input placeholder='https://example.com' {...field} />
                    </FormControl>
                    <FormDescription>Optional project website</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Avatar URL */}
              <FormField
                control={form.control}
                name='avatar'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder='https://example.com/avatar.jpg' {...field} />
                    </FormControl>
                    <FormDescription>Optional project avatar image</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className='flex justify-end gap-4 pt-6 border-t'>
              {onCancel && (
                <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
                  <X className='h-4 w-4 mr-2' />
                  Cancel
                </Button>
              )}
              <Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
                {isSubmitting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
