'use client';

import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import React, { useState, useCallback } from 'react';
import { Loader2, Plus } from 'lucide-react';
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

import BoardColumn from './board-column';
import { cn } from '@shared/utils';
import {
  CreateIssueStatusInput,
  CreateIssueStatusSchema,
} from 'apps/pm-ms-ui/src/lib/schemas/issue-status';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@shadcn-ui/components/form';
import { toast } from 'sonner';
import { useIssues, useIssueStatues } from 'apps/pm-ms-ui/src/hooks/use-issue';
import lexorank from 'apps/pm-ms-ui/src/lib/utils/lexorank';

const CreateStatusDialog: React.FC<{
  onCreateStatus: (statusData: CreateIssueStatusInput) => Promise<void>;
}> = ({ onCreateStatus }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateIssueStatusInput>({
    resolver: zodResolver(CreateIssueStatusSchema),
    defaultValues: { name: '', description: '', color: '#6B7280', sequence: 0 },
  });

  const handleSubmit = useCallback(async (data: CreateIssueStatusInput) => {
    try {
      await onCreateStatus(data);
      form.reset();
      setOpen(false);
      toast.success('Status created successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create status: ${msg}`);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='flex items-center gap-2 bg-white hover:bg-gray-50 border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200'
        >
          <Plus className='w-4 h-4' />
          Add Status
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
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
      </DialogContent>
    </Dialog>
  );
};

const BoardContainer: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { issues, reorderIssue } = useIssues({ projectId }, { enabled: false }); // all issues
  const { issueStatuses, fetchIssueStatuses, reorderIssueStatus, createIssueStatus } =
    useIssueStatues(projectId);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, type, draggableId } = result;

      if (!destination) return;

      const isSameLocation = destination.droppableId === source.droppableId;
      const isSameIndex = destination.index === source.index;
      if (isSameLocation && isSameIndex) return;

      if (type === 'status') {
        let destType: 'before' | 'after' | undefined = undefined;
        let destParam: string | undefined = undefined;

        const statusId = draggableId;
        const otherStatuses = issueStatuses.filter((status) => status.id !== statusId);
        if (destination.index === 0) {
          if (otherStatuses.length > 0) {
            destType = 'before';
            destParam = otherStatuses[0].id;
          } else {
            destType = undefined;
            destParam = undefined;
          }
        } else if (destination.index >= otherStatuses.length) {
          destType = undefined;
          destParam = undefined;
        } else {
          destType = 'after';
          destParam = otherStatuses[destination.index - 1].id;
        }

        reorderIssueStatus.mutate(
          { source: [{ id: statusId }], dest: { destType, destParam } },
          {
            onSuccess: () => toast.success('Status reordered successfully', { duration: 1000 }),
            onError: () => toast.error('Failed to reorder status', { duration: 1000 }),
          },
        );
      }

      if (type === 'issue') {
        let destType: 'before' | 'after' | undefined = undefined;
        let destParam: string | undefined = undefined;

        const issueId = draggableId;
        const newStatusId = destination.droppableId;

        const targetStatusIssues = issues
          .filter((issue) => issue.statusId === newStatusId && issue.id !== issueId)
          .sort((a, b) => lexorank.compare(a.rank, b.rank));

        if (destination.index === 0) {
          // ✅ Đặt ở đầu danh sách trong status
          if (targetStatusIssues.length > 0) {
            destType = 'before';
            destParam = targetStatusIssues[0].id;
          } else {
            // ✅ Status trống
            destType = undefined;
            destParam = undefined;
          }
        } else if (destination.index >= targetStatusIssues.length) {
          // ✅ Đặt ở cuối danh sách trong status
          destType = undefined;
          destParam = undefined;
        } else {
          // ✅ Đặt ở giữa danh sách trong status
          destType = 'after';
          destParam = targetStatusIssues[destination.index - 1].id;
        }

        reorderIssue.mutate(
          {
            source: { ids: [issueId] },
            dest: {
              statusId: newStatusId,
              destType,
              destParam,
            },
          },
          {
            onSuccess: () => toast.success('Issue moved successfully', { duration: 1000 }),
            onError: () => toast.error('Failed to move issue', { duration: 1000 }),
          },
        );
      }
    },
    [issues, reorderIssueStatus, projectId],
  );

  if (fetchIssueStatuses.isPending) {
    return <FullLoading message={'Loading project statuses...'} />;
  }

  if (fetchIssueStatuses.isError) {
    return <FullLoading message={'Failed to load project statuses. Please try again later.'} />;
  }

  return (
    <section className='w-full h-full'>
      <div className={cn('container mx-auto px-4 py-6', 'flex flex-col gap-4 h-full')}>
        <div className='flex justify-between items-center'>
          <CreateStatusDialog onCreateStatus={(input) => createIssueStatus.mutateAsync(input)} />
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId='all-columns' direction='horizontal' type='status'>
            {(provided) => (
              <div
                className={cn(
                  'w-full flex overflow-x-auto gap-4',
                  // snapshot.isDraggingOver ? 'bg-gray-100' : 'bg-white',
                )}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {issueStatuses.map((status, index) => (
                  <Draggable key={status.id} draggableId={status.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn('flex flex-col gap-2 min-w-[250px] max-w-[300px]')}
                      >
                        <BoardColumn column={status} projectId={projectId} index={index} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </section>
  );
};

export default BoardContainer;

const FullLoading = (props: { message?: string | React.ReactNode }) => {
  return (
    <div className={cn('w-full h-full flex flex-col items-center justify-center')}>
      <Loader2 className='w-8 h-8 animate-spin mt-4' />
      <div className='text-center mt-4'>{props.message}</div>
    </div>
  );
};
