'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@shadcn-ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/components/dialog';
import { cn } from '@shared/utils';
import { ChangeIconForm } from './change-icon-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shadcn-ui/components/form';
import { Input } from '@shadcn-ui/components/input';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useMe } from 'apps/pm-ms-ui/src/hooks/use-user';
import { CreateProjectInput, CreateProjectSchema } from 'apps/pm-ms-ui/src/lib/schemas/project';
import { projectApi } from 'apps/pm-ms-ui/src/lib/api/project';

// TODO: move to utils
function base64ToImgFile(base64: string, filename: string, defaultMimeType = 'image/jpeg'): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || defaultMimeType;
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

export function ProjectCreateForm() {
  const getMe = useMe(true);
  const [icon, setIcon] = useState<string | null>(null);
  const [changeIconDialogOpen, setChangeIconDialogOpen] = useState(false);

  const createProjectMutation = useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      return toast.promise(projectApi.create(input), {
        loading: 'Creating project...',
        success: 'Project created successfully',
        error: (error: any) => {
          console.error('Project creation error:', error);
          return error?.message || 'Failed to create project';
        },
      });
    },
  });

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: { name: '', key: '', type: 'SOFTWARE' },
  });

  useEffect(() => {
    if (getMe.data) form.setValue('leadId', getMe.data.id);
  }, [getMe.data, form]);

  const handleIconChange = useCallback((newicon: string) => {
    if (!newicon) throw new Error('Icon cannot be null');
    setIcon(newicon);
    const file = base64ToImgFile(newicon, 'project-icon.png');
    form.setValue('avatar', file);
  }, []);

  const onSubmit = useCallback(async (data: CreateProjectInput) => {
    createProjectMutation.mutate(data);
  }, []);

  return (
    <div
      id='project-creation-form'
      className={cn(
        'w-full max-w-2xl p-6 bg-white rounded-sm border-2',
        //
      )}
    >
      <h2 className='text-xl font-semibold mb-4'>Create New Project</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.warn('Form invalid!', errors);
          })}
          className='flex flex-col gap-4'
        >
          <div>
            {/* avatar */}
            <div className='flex flex-col items-center gap-2'>
              <Image
                width={150}
                height={150}
                src={icon || 'https://picsum.photos/seed/picsum/150/150'}
                alt='Project Icon Preview'
                className='w-36 h-36 rounded-sm border-2'
              />

              <Dialog open={changeIconDialogOpen} onOpenChange={setChangeIconDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant='outline' onClick={() => setChangeIconDialogOpen(true)}>
                    Change Icon
                  </Button>
                </DialogTrigger>

                <DialogContent
                  className={cn(
                    'max-w-full sm:max-w-lg h-full sm:h-auto border-0 rounded-none sm:rounded-lg',
                    // 'sm:max-w-lg max-w-full h-full sm:h-auto border-0 rounded-none',
                    // ""
                  )}
                >
                  <DialogHeader>
                    <DialogTitle>Choose Project Icon</DialogTitle>
                  </DialogHeader>
                  <ChangeIconForm onchangeIcon={handleIconChange} icon={icon} />
                  <DialogFooter>
                    <Button variant='outline' onClick={() => setChangeIconDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button>Select</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter your name' type='text' autoComplete='name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='key'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Key</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter project key'
                    type='text'
                    autoComplete='off'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter project description'
                    type='text'
                    autoComplete='off'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Type</FormLabel>
                <FormControl>
                  <select
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    {...field}
                  >
                    <option value='SOFTWARE'>Software</option>
                    <option value='MARKETING'>Marketing</option>
                    <option value='RESEARCH'>Research</option>
                    <option value='DESIGN'>Design</option>
                    <option value='OTHER'>Other</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex items-center justify-between space-x-4'>
            <Button variant='outline' type='reset' onClick={() => form.reset()}>
              Cancel
            </Button>
            <Button type='submit' className='cursor-pointer'>
              Create Project
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// {/* <form
//   onSubmit={form.handleSubmit((data) => {
//     // Handle form submission
//     console.log('Form submitted with data:', data);
//     // You can call your API here to create the project
//   })}
//   className='space-y-4'
// >
//   <div>
//     <label className='block text-sm font-medium mb-2'>Project Name</label>
//     <input
//       type='text'
//       className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//       placeholder='Enter project name'
//     />
//   </div>

//   {/* template */}
//   <div className=''>
//     <label className='block text-sm font-medium mb-2'>Project Template</label>
//     <select
//       className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//       defaultValue='basic'
//     >
//       <option value='basic'>Basic</option>
//       <option value='advanced'>Advanced</option>
//       <option value='custom'>Custom</option>
//     </select>
//   </div>

//   <div>
//     <label className='block text-sm font-medium mb-2'>Project type</label>
//     <select
//       className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//       defaultValue='development'
//     >
//       <option value='development'>Development</option>
//       <option value='research'>Research</option>
//       <option value='design'>Design</option>
//       <option value='marketing'>Marketing</option>
//     </select>
//   </div>

//   <div>
//     <label className='block text-sm font-medium mb-2'>Key</label>
//     <input
//       type='text'
//       className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//       placeholder='Enter project key'
//     />
//   </div>

//   <h2 className='text-lg font-semibold mt-4 mb-2'>Invite People</h2>
//   <label className='block text-sm font-medium mb-2'>Invite People</label>
//   <input
//     type='email'
//     className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//     placeholder='Enter email addresses'
//   />

//   <div className='mt-2'>
//     <label className='block text-sm font-medium mb-2'>Role</label>
//     <select
//       className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//       defaultValue='member'
//     >
//       <option value='admin'>Admin</option>
//       <option value='member'>Member</option>
//       <option value='viewer'>Viewer</option>
//     </select>
//   </div>

//   <div className='flex items-center justify-between space-x-4 mt-4'>
//     <Button variant='outline'>Cancel</Button>
//     <Button
//       type='submit'
//       className='w-full sm:w-auto'
//       onClick={() => {
//         form.handleSubmit((data) => {
//           console.log('Form submitted with data:', data);
//           // You can call your API here to create the project
//         })();
//       }}
//     >
//       Create Project
//     </Button>
//   </div>
// </form>; */}
