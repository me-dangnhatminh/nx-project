import { Droppable } from '@hello-pangea/dnd';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Calendar, UserIcon, X, Check, MoreHorizontal, Edit, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn-ui/components/dialog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';
import { Button } from '@shadcn-ui/components/button';
import { Input } from '@shadcn-ui/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/components/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn-ui/components/popover';
import { Calendar as CalendarComponent } from '@shadcn-ui/components/calendar';

import { format } from 'date-fns';

import BoardIssue from './board-issue';
import { Issue, User } from './in-type';
import { AssigneeSelectionForm } from './assignee-selection-form';
import { useMe } from '@pm-ms-ui/hooks/use-user';

export interface Column {
  id: string;
  title: string;
  description?: string;
  color?: string;
  order?: number;
  issues: Issue[];
}

interface CreateIssueFormProps {
  onSubmit: (issue: CreateIssueData) => Promise<void>;
  onCancel: () => void;
  columnId: string;
  projectId: string;
}

interface CreateIssueData {
  key: string;
  summary: string;
  description?: string;
  typeId: string;
  statusId: string;
  priorityId: string;
  projectId: string;
  reporterId?: string;
  assigneeId?: string;
  dueDate?: string;
}

interface AssigneeSelectProps {
  selectedUser?: User;
  onSelect: (user: User | undefined) => void;
}

interface ColumnActionsProps {
  column: Column;
  onRename: (columnId: string, newName: string) => void;
  onDelete: (columnId: string) => void;
}

// Mock data for default values - you should fetch these from your API
const DEFAULT_ISSUE_TYPE_ID = 'default-task-type';
const DEFAULT_PRIORITY_ID = 'default-medium-priority';

const ColumnActions: React.FC<ColumnActionsProps> = ({ column, onRename, onDelete }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(column.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = useCallback(() => {
    if (newName.trim() && newName.trim() !== column.title) {
      onRename(column.id, newName.trim());
    }
    setIsRenaming(false);
  }, [newName, column.id, column.title, onRename]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleRename();
      } else if (e.key === 'Escape') {
        setNewName(column.title);
        setIsRenaming(false);
      }
    },
    [handleRename, column.title],
  );

  const handleDelete = useCallback(() => {
    if (
      confirm(
        `Are you sure you want to delete "${column.title}" column? This action cannot be undone.`,
      )
    ) {
      onDelete(column.id);
    }
  }, [column.id, column.title, onDelete]);

  if (isRenaming) {
    return (
      <Input
        ref={inputRef}
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onBlur={handleRename}
        onKeyDown={handleKeyDown}
        className='text-sm font-semibold'
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1'>
          <MoreHorizontal className='w-4 h-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setIsRenaming(true)}>
          <Edit className='w-4 h-4 mr-2' />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className='text-red-600'>
          <Trash className='w-4 h-4 mr-2' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
              <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
              <AvatarFallback>
                {selectedUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
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

const CreateIssueForm: React.FC<CreateIssueFormProps> = ({
  onSubmit,
  onCancel,
  columnId,
  projectId,
}) => {
  const getMe = useMe();
  const CURRENT_USER_ID = getMe.data?.id;

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assignee, setAssignee] = useState<User | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Generate a unique issue key based on project and timestamp
  const generateIssueKey = useCallback(() => {
    const timestamp = Date.now();
    return `ISSUE-${timestamp}`;
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const issueData: CreateIssueData = {
          key: generateIssueKey(),
          summary: title.trim(),
          description: '',
          typeId: DEFAULT_ISSUE_TYPE_ID,
          statusId: columnId, // Use column ID as status ID
          priorityId: DEFAULT_PRIORITY_ID,
          projectId: projectId,
          reporterId: CURRENT_USER_ID,
          assigneeId: assignee?.id,
          dueDate: dueDate?.toISOString(),
        };

        await onSubmit(issueData);

        // Reset form
        setTitle('');
        setDueDate(undefined);
        setAssignee(undefined);
      } catch (error) {
        console.error('Error creating issue:', error);
        // You might want to show a toast notification here
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, dueDate, assignee, onSubmit, isSubmitting, generateIssueKey, columnId, projectId],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    },
    [onCancel],
  );

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-3 shadow-sm'>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='What needs to be done?'
          className='mb-3 border-none p-0 text-sm focus-visible:ring-0 shadow-none'
          disabled={isSubmitting}
        />

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {/* Due Date Picker */}
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type='button'
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
                    dueDate
                      ? 'bg-orange-100 border-orange-300 text-orange-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                  title='Set due date'
                  disabled={isSubmitting}
                >
                  <Calendar className='w-3 h-3' />
                  {dueDate ? format(dueDate, 'MMM dd, yyyy') : 'Due date'}
                </button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <CalendarComponent
                  mode='single'
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Assignee Select */}
            <AssigneeSelect selectedUser={assignee} onSelect={setAssignee} />
          </div>

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onCancel}
              className='h-8 px-3 text-gray-600'
              disabled={isSubmitting}
            >
              <X className='w-4 h-4' />
            </Button>
            <Button
              type='submit'
              size='sm'
              disabled={!title.trim() || isSubmitting}
              className='h-8 px-3'
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

interface BoardColumnProps {
  column: Column;
  projectId: string;
  index: number;
  onIssueClick?: (issue: Issue) => void;
  onIssueCreate?: (columnId: string, issue: CreateIssueData) => Promise<void>;
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
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateIssue = useCallback(
    async (issueData: CreateIssueData) => {
      try {
        await onIssueCreate?.(column.id, issueData);
        setShowCreateForm(false);
      } catch (error) {
        console.error('Error in handleCreateIssue:', error);
        // Keep form open on error so user can retry
        throw error;
      }
    },
    [column.id, onIssueCreate],
  );

  const handleRename = useCallback(
    (columnId: string, newName: string) => {
      onColumnRename?.(columnId, newName);
    },
    [onColumnRename],
  );

  const handleDelete = useCallback(
    (columnId: string) => {
      onColumnDelete?.(columnId);
    },
    [onColumnDelete],
  );

  const handleShowCreateForm = useCallback(() => {
    setShowCreateForm(true);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  return (
    <div className='flex-shrink-0 w-72 mx-2'>
      <div className='bg-gray-50 rounded-lg p-4 h-full'>
        {/* Column Header */}
        <div className='flex justify-between items-center mb-4'>
          <div className='flex-1 flex items-center gap-2'>
            <h2 className='font-semibold text-gray-800'>{column.title}</h2>
            <span className='bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full'>
              {column.issues.length}
            </span>
          </div>
          <ColumnActions column={column} onRename={handleRename} onDelete={handleDelete} />
        </div>

        {/* Issues List */}
        <Droppable droppableId={column.id} type='task'>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                min-h-[200px] pb-2
                ${
                  snapshot.isDraggingOver
                    ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg'
                    : ''
                }
              `}
            >
              {column.issues.map((issue, issueIndex) => (
                <BoardIssue
                  key={issue.id}
                  issue={issue}
                  index={issueIndex}
                  columnId={column.id}
                  onClick={onIssueClick}
                  onUpdate={onIssueUpdate}
                  onDelete={onIssueDelete}
                />
              ))}
              {provided.placeholder}

              {/* Create Issue Form or Add Button */}
              {showCreateForm ? (
                <CreateIssueForm
                  onSubmit={handleCreateIssue}
                  onCancel={handleCancelCreate}
                  columnId={column.id}
                  projectId={projectId}
                />
              ) : (
                <button
                  onClick={handleShowCreateForm}
                  className='w-full mt-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors duration-200 text-left'
                >
                  + Add a card
                </button>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default BoardColumn;
