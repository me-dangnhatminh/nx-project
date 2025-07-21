'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/components/dialog';
import { Button } from '@shadcn-ui/components/button';
import { Input } from '@shadcn-ui/components/input';
import { Label } from '@shadcn-ui/components/label';

import {
  CreateIssueStatusInput,
  CreateIssueStatusSchema,
} from 'apps/pm-ms-ui/src/lib/schemas/issue-status';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@shadcn-ui/components/form';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const CreateIssueStatusForm: React.FC<{
  onCreateStatus: (statusData: CreateIssueStatusInput) => Promise<void>;
}> = ({ onCreateStatus }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateIssueStatusInput>({
    resolver: zodResolver(CreateIssueStatusSchema),
    defaultValues: { name: '', description: '', color: '#6B7280', sequence: 0 },
  });
  const handleSubmit = useCallback(
    async (data: CreateIssueStatusInput) => {
      await onCreateStatus(data);
      form.reset();
      setOpen(false);
    },
    [form, onCreateStatus],
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) form.reset();
      setOpen(isOpen);
    },
    [form],
  );
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <DialogHeader>
          <DialogTitle>Create New Status</DialogTitle>
          <DialogDescription>
            Add a new status column to organize your tasks better.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input
              {...form.register('name')}
              id='name'
              className='col-span-3'
              placeholder='Enter status name'
              autoFocus
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='description' className='text-right'>
              Description
            </Label>
            <Input
              id='description'
              {...form.register('description')}
              className='col-span-3'
              placeholder='Optional description'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='color' className='text-right'>
              Color
            </Label>
            <div className='col-span-3 flex items-center gap-2'>
              <input
                {...form.register('color')}
                type='color'
                id='color'
                className='w-12 h-8 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed'
              />
              <Input {...form.register('color')} className='flex-1' placeholder='#6B7280' />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            className='bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            className='bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            Create Status
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CreateIssueStatusForm;
