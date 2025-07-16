import { Droppable } from '@hello-pangea/dnd';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Calendar,
  UserIcon,
  X,
  Check,
  MoreHorizontal,
  Edit,
  Trash,
  Loader,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/components/dialog';
import { Button } from '@shadcn-ui/components/button';
import { Input } from '@shadcn-ui/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/components/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn-ui/components/popover';
import { Calendar as CalendarComponent } from '@shadcn-ui/components/calendar';

import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import BoardIssue from './board-issue';
import { AssigneeSelectionForm } from './assignee-selection-form';
import { cn } from 'libs/shadcn-ui/src/lib/utils';
import BoardColumnActions from './board-column-actions';
import { toast } from 'sonner';
import { CreateIssueInput, CreateIssueSchema } from 'apps/pm-ms-ui/src/lib/schemas/issue';
import { Form } from '@shadcn-ui/components/form';
import { useProjectIssue } from 'apps/pm-ms-ui/src/hooks/use-issue';
import { useProjectStatus } from 'apps/pm-ms-ui/src/hooks/use-status';
import { Issue, IssueStatus, User } from 'apps/pm-ms-ui/src/lib/types';

interface AssigneeSelectProps {
  selectedUser?: User;
  onSelect: (user?: User) => void;
}

const DEFAULT_ISSUE_TYPE_ID = 'default-task-type';
const DEFAULT_PRIORITY_ID = 'default-medium-priority';

const AssigneeSelect: React.FC<AssigneeSelectProps> = ({ selectedUser, onSelect }) => {
  const [open, setOpen] = useState(false);

  const handleUserSelect = useCallback(
    (user: User) => {
      onSelect(user);
      setOpen(false);
    },
    [onSelect],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type='button'
          className='flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors'
          title='Assign to someone'
        >
          {selectedUser ? (
            <Avatar className='w-8 h-8'>
              {/* <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} /> */}
              <AvatarFallback>
                {([selectedUser.firstName, selectedUser.lastName].join(' ').trim() ||
                  'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <UserIcon className='w-4 h-4 text-gray-400' />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Assign to</DialogTitle>
          <DialogDescription>Select a person to assign this task to.</DialogDescription>
        </DialogHeader>
        <AssigneeSelectionForm
          onSelect={(user) => {
            handleUserSelect(user);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

const CreateIssueForm: React.FC<{
  onSubmit: (issue: CreateIssueInput) => Promise<void>;
  onCancel: () => void;
  columnId: string;
  projectId: string;
}> = ({ onSubmit, onCancel, columnId, projectId }) => {
  const { createIssue } = useProjectIssue(projectId, { statusId: columnId });

  const generateIssueKey = useCallback(() => {
    const timestamp = Date.now();
    return `ISSUE-${timestamp}`;
  }, []);

  const form = useForm<CreateIssueInput>({
    resolver: zodResolver(CreateIssueSchema),
    defaultValues: {
      key: generateIssueKey(),
      summary: '',
      typeId: DEFAULT_ISSUE_TYPE_ID,
      priorityId: DEFAULT_PRIORITY_ID,
      statusId: columnId,
      projectId: projectId,
    },
  });

  const dueDate = form.watch('dueDate');
  const [assignee, setAssignee] = useState<User | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (data: CreateIssueInput) => {
      if (createIssue.isPending) return;
      data.key = generateIssueKey();
      createIssue.mutate(data, {
        onSuccess: () => {
          toast.success('Issue created successfully!');
          onSubmit(data);
        },
        onError: (error: any) => {
          console.error('Error creating issue:', error);
          toast.error('Failed to create issue. Please try again.');
          if (inputRef.current) inputRef.current.focus();
        },
      });
    },
    [createIssue, generateIssueKey],
  );

  return (
    <Form {...form}>
      <form
        className='bg-white border border-gray-200 rounded-lg p-3 shadow-sm'
        onSubmit={form.handleSubmit(handleSubmit, (error) => {
          console.error('Form submission error:', error);
          toast.error('Please fill in all required fields correctly.');
          if (inputRef.current) {
            inputRef.current.focus();
          }
        })}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
        }}
      >
        <Input
          {...form.register('summary')}
          placeholder='What needs to be done?'
          className='mb-3 border-none p-0 text-sm focus-visible:ring-0 shadow-none'
          disabled={createIssue.isPending}
        />

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  className={cn(
                    'transition-colors rounded text-gray-600 flex items-center gap-1 px-2 py-1 text-xs',
                    dueDate ? 'bg-orange-100 text-orange-700' : 'text-gray-600',
                    dueDate
                      ? 'hover:bg-orange-200 hover:text-orange-800'
                      : 'hover:bg-gray-100 hover:text-gray-700',
                  )}
                  title='Set due date'
                  disabled={createIssue.isPending}
                >
                  <Calendar className='w-4 h-4' />
                  {dueDate && <span className='text-xs'>{format(dueDate, 'MMM dd')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <CalendarComponent
                  mode='single'
                  onSelect={(date) => {
                    const old = dueDate;
                    if (!date || date?.toISOString() === old) form.setValue('dueDate', undefined);
                    else form.setValue('dueDate', date.toISOString());
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <AssigneeSelect
              selectedUser={assignee}
              onSelect={(user) => {
                setAssignee(user);
                form.setValue('assigneeId', user ? user.id : undefined);
              }}
            />
          </div>

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onCancel}
              className='h-8 px-3 text-gray-600'
              disabled={createIssue.isPending}
            >
              <X className='w-4 h-4' />
            </Button>
            <Button
              type='submit'
              size='sm'
              className='h-8 px-3'
              disabled={createIssue.isPending || !form.formState.isValid}
            >
              {createIssue.isPending ? (
                <Loader className='w-4 h-4 animate-spin' />
              ) : (
                <Check className='w-4 h-4' />
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

interface BoardColumnProps {
  column: IssueStatus;
  projectId: string;
  index: number;
  onIssueClick?: (issue: Issue) => void;
  onIssueCreate?: (columnId: string, issue: CreateIssueInput) => Promise<void>;
  onIssueUpdate?: (issue: Issue) => void;
  onIssueDelete?: (issueId: string, columnId: string) => void;
  onColumnRename?: (columnId: string, newName: string) => void;
  onColumnDelete?: (columnId: string) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  projectId,
  index,
  onIssueClick,
  onIssueCreate,
  onIssueUpdate,
  onIssueDelete,
  onColumnRename,
  onColumnDelete,
}) => {
  const { deleteStatus, renameStatus } = useProjectStatus(projectId);
  const { issues } = useProjectIssue(projectId, { statusId: column.id });

  const [columnAction, setColumnAction] = useState<'rename' | 'delete' | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const handleCreateIssue = useCallback(
    async (issue: CreateIssueInput) => {
      try {
        await onIssueCreate?.(column.id, issue);
        setShowCreateForm(false);
      } catch (error) {
        console.error('Error in handleCreateIssue:', error);
        throw error;
      }
    },
    [column.id, onIssueCreate],
  );

  return (
    <div className={cn('flex flex-col gap-4', 'bg-white rounded-lg p-3', 'border border-gray-200')}>
      <div hidden={!!columnAction} className='flex justify-between items-center'>
        <h2 className='text-md font-semibold'>{column.name}</h2>
        <BoardColumnActions
          column={column}
          onRename={() => setColumnAction('rename')}
          onDelete={() => setColumnAction('delete')}
        />
      </div>

      {columnAction === 'rename' && (
        <div
          className='flex flex-row gap-2 w-full items-center justify-between'
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            defaultValue={column.name}
            placeholder='Rename column...'
            autoFocus={true}
            onBlur={() => setColumnAction(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const { value } = e.currentTarget;
                const newName = value.trim();
                if (newName.length < 1) return;
                if (!newName.trim()) return;
                if (renameStatus.isPending) return;
                const statusId = column.id;
                renameStatus.mutate({ statusId, name: newName });
              } else if (e.key === 'Escape') setColumnAction(null);
            }}
          />
          {renameStatus.isPending ? (
            <Loader className='animate-spin' />
          ) : (
            <Button variant='outline' onClick={() => setColumnAction(null)}>
              <X />
            </Button>
          )}
        </div>
      )}

      {columnAction === 'delete' && (
        <div className='flex items-center justify-between'>
          <span className='text-sm text-red-600'>Are you sure?</span>
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='destructive'
              onClick={() => deleteStatus.mutate(column.id)}
              disabled={deleteStatus.isPending}
            >
              <Trash />
            </Button>
            <Button
              disabled={deleteStatus.isPending}
              size='sm'
              variant='outline'
              className='text-gray-500'
              onClick={() => setColumnAction(null)}
            >
              {deleteStatus.isPending ? <Loader className='animate-spin' /> : <X />}
            </Button>
          </div>
        </div>
      )}

      {/* =================================== */}
      <Droppable droppableId={column.id} type='issue'>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn('flex flex-col gap-2')}
          >
            {issues.map((issue: Issue, issueIndex: number) => (
              <BoardIssue key={issue.id} issue={issue} columnId={column.id} index={issueIndex} />
            ))}

            {provided.placeholder}

            {showCreateForm ? (
              <CreateIssueForm
                onSubmit={handleCreateIssue}
                onCancel={() => setShowCreateForm(false)}
                columnId={column.id}
                projectId={projectId}
              />
            ) : (
              <Button variant='outline' onClick={() => setShowCreateForm(true)}>
                <Plus />
                Add a card
              </Button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default BoardColumn;
