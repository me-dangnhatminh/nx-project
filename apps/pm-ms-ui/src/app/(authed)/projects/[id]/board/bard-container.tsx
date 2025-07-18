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
} from 'apps/pm-ms-ui/src/lib/schemas/status';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@shadcn-ui/components/form';
import { toast } from 'sonner';
import { useProjectStatuses } from 'apps/pm-ms-ui/src/hooks/use-status';
import { useProjectIssues } from 'apps/pm-ms-ui/src/hooks/use-issue';

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
  const { statuses, fetchStatuses, createStatus, reorderStatus } = useProjectStatuses(projectId);
  const { issues, setIssues } = useProjectIssues(projectId, {}, { enabled: false }); // all issues

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, type, draggableId } = result;

      if (!destination) return;
      const isSameLocation = destination.droppableId === source.droppableId;
      const isSameIndex = destination.index === source.index;
      if (isSameLocation && isSameIndex) return;

      if (type === 'column') {
        const sequence = destination.index + 1;
        reorderStatus.mutate(
          { statusId: draggableId, sequence },
          {
            onSuccess: () => toast.success('Status reordered successfully'),
            onError: () => toast.error('Failed to reorder status'),
          },
        );
      }

      if (type === 'issue') {
        const sourceColumnId = source.droppableId;
        const destinationColumnId = destination.droppableId;

        const sourceColumn = statuses.find((s) => s.id === sourceColumnId);
        const destinationColumn = statuses.find((s) => s.id === destinationColumnId);

        if (!sourceColumn || !destinationColumn) {
          toast.error('Source or destination column not found');
          return;
        }

        const sourceIssues = issues.filter((issue) => issue.statusId === sourceColumn.id);
        const destinationIssues = issues.filter((issue) => issue.statusId === destinationColumn.id);

        const movedIssue = sourceIssues[source.index];
        if (!movedIssue) {
          toast.error('Issue not found in source column');
          return;
        }

        // Nếu cùng column (reorder trong column)
        if (sourceColumnId === destinationColumnId) {
          const newOrder = Array.from(sourceIssues);
          const [removed] = newOrder.splice(source.index, 1);
          newOrder.splice(destination.index, 0, removed);

          // Update lại toàn bộ sequence cho column đó
          const updatedIssues = issues.map((issue) => {
            if (issue.statusId !== sourceColumnId) return issue;
            const idx = newOrder.findIndex((i) => i.id === issue.id);
            return { ...issue, sequence: idx + 1 }; // FIXME: missig isues sequence
          });

          setIssues(updatedIssues);
          return;
        }

        // Nếu di chuyển sang column khác
        const newIssue = {
          ...movedIssue,
          statusId: destinationColumnId,
          sequence: destinationIssues.length + 1,
        };

        const updatedIssues = issues.map((issue) =>
          issue.id === movedIssue.id ? newIssue : issue,
        );

        setIssues(updatedIssues);
      }
    },
    [statuses, reorderStatus, projectId],
  );

  if (fetchStatuses.isPending) {
    return <FullLoading message={'Loading project statuses...'} />;
  }

  if (fetchStatuses.isError) {
    return <FullLoading message={'Failed to load project statuses. Please try again later.'} />;
  }

  return (
    <section className='w-full h-full'>
      <div className={cn('container mx-auto px-4 py-6', 'flex flex-col gap-4 h-full')}>
        <div className='flex justify-between items-center'>
          <CreateStatusDialog onCreateStatus={(input) => createStatus.mutateAsync(input)} />
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId='all-columns' direction='horizontal' type='column'>
            {(provided, snapshot) => (
              <div
                className={cn(
                  'w-full flex overflow-x-auto gap-4',
                  // snapshot.isDraggingOver ? 'bg-gray-100' : 'bg-white',
                )}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {statuses.map((column, index) => (
                  <Draggable key={column.id} draggableId={column.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn('flex flex-col gap-2 min-w-[250px] max-w-[300px]')}
                      >
                        <BoardColumn column={column} projectId={projectId} index={index} />
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
// {/* Issue Detail Sheet */}
// <IssueDetailSheet
//   issue={selectedIssue}
//   open={sheetOpen}
//   onOpenChange={setSheetOpen}
//   onUpdate={handleIssueUpdate}
//   columns={columns}
// />
