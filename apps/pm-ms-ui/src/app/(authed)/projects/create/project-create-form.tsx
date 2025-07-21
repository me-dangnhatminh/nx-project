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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shadcn-ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn-ui/components/select';
import { Textarea } from '@shadcn-ui/components/textarea';
import { Badge } from '@shadcn-ui/components/badge';
import { Separator } from '@shadcn-ui/components/separator';
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
  FormDescription,
} from '@shadcn-ui/components/form';
import { Input } from '@shadcn-ui/components/input';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';

import { useMe } from 'apps/pm-ms-ui/src/hooks/use-user';
import { CreateProjectInput, CreateProjectSchema } from 'apps/pm-ms-ui/src/lib/schemas/project';
import { useProjects } from 'apps/pm-ms-ui/src/hooks/use-project';
import { useRouter } from 'next/navigation';

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

function genKeyFromName(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].toUpperCase();
  if (parts.length >= 2) return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ProjectCreateForm() {
  const router = useRouter();
  const { createProject } = useProjects();
  const { fetchMe } = useMe();
  if (fetchMe.isError) throw new Error(`Failed to fetch user: ${fetchMe.error.message}`);
  const me = fetchMe.data;

  // State management
  const [icon, setIcon] = useState<string>('/icons/1000.svg');

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: { type: 'SOFTWARE' }, //TODO: set default type
  });

  const watchedName = form.watch('name');

  // Auto-generate key from name
  useEffect(() => {
    if (watchedName && !form.getValues('key')) {
      const generatedKey = genKeyFromName(watchedName);
      form.setValue('key', generatedKey);
    }
  }, [watchedName, form]);

  useEffect(() => {
    if (me) form.setValue('leadId', me.id);
  }, [me, form]);

  const handleIconChange = useCallback(
    (newicon: string) => {
      if (!newicon) throw new Error('Icon cannot be null');
      setIcon(newicon);
      const file = base64ToImgFile(newicon, 'project-icon.png');
      form.setValue('avatar', file);
    },
    [form],
  );

  const handleSubmit = useCallback(
    async (data: CreateProjectInput) => {
      if (createProject.isPending) return;
      await createProject.mutateAsync(data, {
        onError: (error) => {
          toast.error(`Failed to create project: ${error.message}`);
        },
        onSuccess: (data) => {
          toast.success('Project created successfully');
          router.push(`/projects/${data.id}`);
          form.reset();
        },
      });
    },
    [createProject, form],
  );

  return (
    <div
      className={cn(
        'container mx-auto',
        'max-w-3xl',
        // 'bg-blue-500',
        // 'min-h-screen bg-gray-50 py-4 px-2 sm:px-4 lg:px-8',
        // 'bg-blue-50',
        //
      )}
    >
      {/* Header */}
      <div className='mb-6 lg:mb-8'>
        <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'>
          Create New Project
        </h1>
        <p className='mt-2 text-sm sm:text-base text-gray-600'>
          Set up your project with all the necessary details
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='flex flex-col gap-6 sm:gap-8 lg:gap-10'
        >
          <div className='relative w-20 h-20 sm:w-28 sm:h-28'>
            <Image
              width={128}
              height={128}
              src={icon}
              alt='Project Icon Preview'
              className='rounded-lg object-cover'
            />

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='absolute -bottom-2 -right-2 rounded-full p-1.5 sm:p-2'
                >
                  <Camera className='h-3 w-3 sm:h-4 sm:w-4' />
                </Button>
              </DialogTrigger>
              <DialogContent className='w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>Choose Project Icon</DialogTitle>
                </DialogHeader>
                <ChangeIconForm
                  onchangeIcon={({ url }) => handleIconChange(url)}
                  icon={{ id: '1000', url: 'icons/1000.svg' }}
                />
                <DialogFooter className='flex flex-col sm:flex-row gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setChangeIconDialogOpen(false)}
                    className='w-full sm:w-auto'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setChangeIconDialogOpen(false)}
                    className='w-full sm:w-auto'
                  >
                    Select
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm sm:text-base'>
                    Project Name <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter project name' className='h-10 sm:h-11' {...field} />
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
                  <FormLabel className='text-sm sm:text-base'>
                    Project Key <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Key' className='h-10 sm:h-11' maxLength={10} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm sm:text-base'>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter project description'
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex items-center justify-end gap-2'>
            <Button hidden type='button' variant='outline'>
              Cancel
            </Button>
            <Button type='submit' className='w-full sm:w-auto' disabled={createProject.isPending}>
              {(createProject.isPending && <Loader2 className='ml-2 h-4 w-4 animate-spin' />) ||
                'Create Project'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// {/* Step 1: Basic Information */}
// {currentStep === 1 && (
//   <Card className='overflow-hidden'>
//     <CardHeader>
//       <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
//         <Settings className='h-4 w-4 sm:h-5 sm:w-5' />
//         Basic Information
//       </CardTitle>
//       <CardDescription className='text-sm'>
//         Provide the basic details for your project
//       </CardDescription>
//     </CardHeader>
//     <CardContent className='space-y-4 sm:space-y-6'>
//       {/* Project Icon */}
//       <div className='flex flex-col items-center gap-4'>
//         <div className='relative'>
//           <Image
//             width={128}
//             height={128}
//             src={icon}
//             alt='Project Icon Preview'
//             className='w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 shadow-sm object-cover'
//           />
//           <Button
//             type='button'
//             size='sm'
//             variant='outline'
//             className='absolute -bottom-2 -right-2 rounded-full p-1.5 sm:p-2'
//             onClick={() => setChangeIconDialogOpen(true)}
//           >
//             <Camera className='h-3 w-3 sm:h-4 sm:w-4' />
//           </Button>
//         </div>

//         <Dialog open={changeIconDialogOpen} onOpenChange={setChangeIconDialogOpen}>
//           <DialogContent className='w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto'>
//             <DialogHeader>
//               <DialogTitle>Choose Project Icon</DialogTitle>
//             </DialogHeader>
//             <ChangeIconForm
//               onchangeIcon={({ url }) => handleIconChange(url)}
//               icon={{ id: '1000', url: 'icons/1000.svg' }}
//             />
//             <DialogFooter className='flex flex-col sm:flex-row gap-2'>
//               <Button
//                 variant='outline'
//                 onClick={() => setChangeIconDialogOpen(false)}
//                 className='w-full sm:w-auto'
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={() => setChangeIconDialogOpen(false)}
//                 className='w-full sm:w-auto'
//               >
//                 Select
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
//         <FormField
//           control={form.control}
//           name='name'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel className='text-sm sm:text-base'>Project Name *</FormLabel>
//               <FormControl>
//                 <Input
//                   placeholder='Enter project name'
//                   className='h-10 sm:h-11'
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name='key'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel className='text-sm sm:text-base'>Project Key *</FormLabel>
//               <FormControl>
//                 <Input
//                   placeholder='AUTO-GENERATED'
//                   className='h-10 sm:h-11 uppercase'
//                   maxLength={10}
//                   {...field}
//                 />
//               </FormControl>
//               <FormDescription className='text-xs sm:text-sm'>
//                 Used to identify issues (e.g., KEY-123)
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       </div>

//       <FormField
//         control={form.control}
//         name='description'
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel className='text-sm sm:text-base'>Description</FormLabel>
//             <FormControl>
//               <Textarea
//                 placeholder='Describe what this project is about...'
//                 className='min-h-[80px] sm:min-h-[100px] resize-none'
//                 {...field}
//               />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <FormField
//         control={form.control}
//         name='type'
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel className='text-sm sm:text-base'>Project Type *</FormLabel>
//             <Select onValueChange={field.onChange} defaultValue={field.value}>
//               <FormControl>
//                 <SelectTrigger className='h-10 sm:h-11'>
//                   <SelectValue placeholder='Select project type' />
//                 </SelectTrigger>
//               </FormControl>
//               <SelectContent>
//                 {PROJECT_TYPES.map((type) => (
//                   <SelectItem key={type.value} value={type.value}>
//                     <div className='flex items-center gap-2'>
//                       <span>{type.icon}</span>
//                       {type.label}
//                     </div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     </CardContent>
//   </Card>
// )}

// {/* Step 2: Project Configuration */}
// {currentStep === 2 && (
//   <Card className='overflow-hidden'>
//     <CardHeader>
//       <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
//         <Settings className='h-4 w-4 sm:h-5 sm:w-5' />
//         Project Configuration
//       </CardTitle>
//       <CardDescription className='text-sm'>
//         Choose how your project will be structured and managed
//       </CardDescription>
//     </CardHeader>
//     <CardContent className='space-y-4 sm:space-y-6'>
//       {/* Project Template */}
//       <div>
//         <label className='text-sm sm:text-base font-medium mb-3 block'>
//           Project Template
//         </label>
//         <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
//           {PROJECT_TEMPLATES.map((tmpl) => (
//             <Card
//               key={tmpl.value}
//               className={cn(
//                 'cursor-pointer transition-all hover:shadow-md',
//                 template === tmpl.value
//                   ? 'ring-2 ring-blue-500 bg-blue-50'
//                   : 'hover:bg-gray-50',
//               )}
//               onClick={() => setTemplate(tmpl.value as ProjectTemplate)}
//             >
//               <CardContent className='p-3 sm:p-4'>
//                 <h4 className='font-medium text-sm sm:text-base'>{tmpl.label}</h4>
//                 <p className='text-xs sm:text-sm text-gray-600 mt-1'>
//                   {tmpl.description}
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>

//       {/* Access Level */}
//       <div>
//         <label className='text-sm sm:text-base font-medium mb-3 block'>
//           Project Access
//         </label>
//         <div className='space-y-3'>
//           {ACCESS_LEVELS.map((access) => {
//             const Icon = access.icon;
//             return (
//               <Card
//                 key={access.value}
//                 className={cn(
//                   'cursor-pointer transition-all hover:shadow-sm',
//                   accessLevel === access.value
//                     ? 'ring-2 ring-blue-500 bg-blue-50'
//                     : 'hover:bg-gray-50',
//                 )}
//                 onClick={() => setAccessLevel(access.value as ProjectAccess)}
//               >
//                 <CardContent className='p-3 sm:p-4'>
//                   <div className='flex items-start gap-3'>
//                     <Icon className='h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-gray-600 flex-shrink-0' />
//                     <div className='min-w-0 flex-1'>
//                       <h4 className='font-medium text-sm sm:text-base'>{access.label}</h4>
//                       <p className='text-xs sm:text-sm text-gray-600 break-words'>
//                         {access.description}
//                       </p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// )}

// {/* Step 3: Team & Access */}
// {currentStep === 3 && (
//   <Card className='overflow-hidden'>
//     <CardHeader>
//       <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
//         <Users className='h-4 w-4 sm:h-5 sm:w-5' />
//         Team & Access
//       </CardTitle>
//       <CardDescription className='text-sm'>
//         Invite team members to collaborate on your project
//       </CardDescription>
//     </CardHeader>
//     <CardContent className='space-y-4 sm:space-y-6'>
//       {/* Invite Form */}
//       <div className='space-y-3'>
//         <div className='flex flex-col gap-3'>
//           <div className='flex flex-col sm:flex-row gap-3'>
//             <Input
//               type='email'
//               placeholder='Enter email address'
//               value={inviteEmail}
//               onChange={(e) => setInviteEmail(e.target.value)}
//               className='flex-1 h-10 sm:h-11'
//             />
//             <Select
//               value={inviteRole}
//               onValueChange={(value) => setInviteRole(value as UserRole)}
//             >
//               <SelectTrigger className='w-full sm:w-32 h-10 sm:h-11'>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value='admin'>Admin</SelectItem>
//                 <SelectItem value='member'>Member</SelectItem>
//                 <SelectItem value='viewer'>Viewer</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <Button
//             type='button'
//             onClick={addInvitedUser}
//             disabled={!inviteEmail}
//             className='h-10 sm:h-11 w-full sm:w-auto'
//           >
//             <Plus className='h-4 w-4 mr-2' />
//             Add Member
//           </Button>
//         </div>
//       </div>

//       {/* Invited Users List */}
//       {invitedUsers.length > 0 && (
//         <div>
//           <h4 className='font-medium mb-3 text-sm sm:text-base'>
//             Invited Members ({invitedUsers.length})
//           </h4>
//           <div className='space-y-2 max-h-60 overflow-y-auto'>
//             {invitedUsers.map((user, index) => (
//               <div
//                 key={index}
//                 className='flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2'
//               >
//                 <div className='flex items-center gap-2 sm:gap-3 min-w-0 flex-1'>
//                   <Mail className='h-4 w-4 text-gray-500 flex-shrink-0' />
//                   <span className='text-xs sm:text-sm truncate'>{user.email}</span>
//                   <Badge
//                     variant='outline'
//                     className='flex items-center gap-1 flex-shrink-0'
//                   >
//                     {getRoleIcon(user.role)}
//                     <span className='hidden sm:inline'>{user.role}</span>
//                   </Badge>
//                 </div>
//                 <Button
//                   type='button'
//                   variant='ghost'
//                   size='sm'
//                   onClick={() => removeInvitedUser(user.email)}
//                   className='flex-shrink-0'
//                 >
//                   <X className='h-4 w-4' />
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Info Message */}
//       <div className='flex items-start gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg'>
//         <Info className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0' />
//         <div className='text-xs sm:text-sm text-blue-700 min-w-0'>
//           <p className='font-medium'>Project Access Summary</p>
//           <p className='break-words'>
//             This project will be {accessLevel} with {template} template.
//             {invitedUsers.length > 0 &&
//               ` ${invitedUsers.length} members will be invited.`}
//           </p>
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// )}
