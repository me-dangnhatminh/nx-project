'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { TableCell, TableRow } from '@shadcn-ui/components/table';
import {
  useIssuePriorities,
  useIssueStatues,
  useIssueTypes,
  useIssues,
} from 'apps/pm-ms-ui/src/hooks/use-issue';
import { useProject } from 'apps/pm-ms-ui/src/hooks/use-project';
import { DataTable } from './data-table';
import { issueColumns } from './issue-column';
import { DataTablePagination } from './data-table-pagination';
import { useReactTable } from '@tanstack/react-table';
import { useParams } from 'next/navigation';
import { Button } from '@shadcn-ui/components/button';
import { Plus, Calendar, Check, X, Loader, UserIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateIssueSchema, CreateIssueInput } from 'apps/pm-ms-ui/src/lib/schemas/issue';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@shadcn-ui/components/select';
import { Input } from '@shadcn-ui/components/input';
import { Form } from '@shadcn-ui/components/form';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Popover, PopoverTrigger, PopoverContent } from '@shadcn-ui/components/popover';
import { Calendar as CalendarComponent } from '@shadcn-ui/components/calendar';
import { cn } from '@shared/utils';
import { AssigneeSelectionForm } from '../board/assignee-selection-form';
import { Avatar, AvatarFallback } from '@shadcn-ui/components/avatar';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shadcn-ui/components/dialog';
import { User } from 'apps/pm-ms-ui/src/lib/types';
import { CreateIssueStatusForm } from '../create-issue-status-form';
import { CreateIssueStatusInput } from 'apps/pm-ms-ui/src/lib/schemas/issue-status';

const AssigneeSelect: React.FC<{
  selectedUser?: User;
  onSelect: (user: User) => void;
}> = ({ selectedUser, onSelect }) => {
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

const AddIssueStatus: React.FC<{
  projectId: string;
}> = ({ projectId }) => {
  const [open, setOpen] = useState(false);
  const { createIssueStatus } = useIssueStatues(projectId);

  const handleSubmit = useCallback(async (data: CreateIssueStatusInput) => {
    try {
      if (createIssueStatus.isPending) return;
      await createIssueStatus.mutateAsync(data);
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
        <Button variant='ghost' size='sm' className='w-full'>
          <Plus className='w-4 h-4' />
          Add Status
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <CreateIssueStatusForm onCreateStatus={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
};

const RowCreate: React.FC<{ table: ReturnType<typeof useReactTable<any>> }> = ({ table }) => {
  const [openCreate, setOpenCreate] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [assignee, setAssignee] = useState<User | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const { id: projectId } = useParams<{ id: string }>();
  if (!projectId) throw new Error('Project ID is required for creating issues');

  const { createIssue } = useIssues({ projectId });
  const { issueStatuses } = useIssueStatues(projectId);
  const { issuePriorities } = useIssuePriorities(projectId);
  const { issueTypes } = useIssueTypes(projectId);

  const generateIssueKey = useCallback(() => {
    const timestamp = Date.now();
    return `ISSUE-${timestamp}`;
  }, []);

  const form = useForm<CreateIssueInput>({
    resolver: zodResolver(CreateIssueSchema),
    defaultValues: { key: generateIssueKey(), statusId: issueStatuses?.[0]?.id },
  });

  console.log('is valid', form.formState.isValid);
  console.log('form values', form.getValues());

  const dueDate = form.watch('dueDate');

  useEffect(() => {
    if (openCreate && inputRef.current) {
      inputRef.current.focus();
    }
  }, [openCreate]);

  const handleSubmit = useCallback(
    async (input: CreateIssueInput) => {
      if (createIssue.isPending) return;
      createIssue.mutate(input, {
        onSuccess: () => {
          form.reset();
          setAssignee(undefined);
          setOpenCreate(false);
          toast.success('Issue created successfully');
        },
        onError: (error) => {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          toast.error(`Failed to create issue: ${msg}`);
        },
      });
    },
    [createIssue],
  );

  const handleCancel = useCallback(() => {
    form.reset();
    setAssignee(undefined);
    setOpenCreate(false);
  }, [form]);

  if (!openCreate) {
    return (
      <TableRow>
        <TableCell colSpan={table.getAllColumns().length}>
          <div
            className='w-full flex items-center gap-2 cursor-pointer p-2 rounded'
            onClick={() => setOpenCreate(true)}
          >
            <Plus className='w-4 h-4' />
            <span className='text-sm text-gray-600'>Add new issue</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={table.getAllColumns().length}>
        <Form {...form}>
          <form
            className={cn('flex flex-row justify-between items-center gap-4')}
            onSubmit={form.handleSubmit(handleSubmit, (error) => {
              console.error('Form submission error:', error);
              toast.error('Failed to create issue');
            })}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
              }
            }}
          >
            <Select
              value={form.watch('statusId')}
              onValueChange={(value) => form.setValue('statusId', value, { shouldValidate: true })}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <AddIssueStatus projectId={projectId} />
                  <SelectLabel>Status</SelectLabel>
                  {issueStatuses?.map((status, idx) => (
                    <SelectItem
                      key={status.id}
                      value={status.id}
                      defaultChecked={idx === 0}
                      className='capitalize'
                    >
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Input
              {...form.register('summary')}
              autoFocus
              placeholder='What needs to be done?'
              className='flex-1'
              disabled={createIssue.isPending}
            />

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  size='sm'
                  variant='ghost'
                  title='Set due date'
                  disabled={createIssue.isPending}
                >
                  <Calendar className='w-4 h-4' />
                  {dueDate && (
                    <span className='text-xs'>{format(new Date(dueDate), 'MMM dd')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <CalendarComponent
                  mode='single'
                  selected={dueDate ? new Date(dueDate) : undefined}
                  onSelect={(date) => {
                    if (!date) {
                      form.setValue('dueDate', undefined, { shouldValidate: true });
                    } else if (date.toISOString() === dueDate) {
                      form.setValue('dueDate', undefined, { shouldValidate: true });
                    } else form.setValue('dueDate', date.toISOString(), { shouldValidate: true });
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
                form.setValue('assigneeId', user?.id);
              }}
            />

            <Button
              type='submit'
              size='sm'
              disabled={createIssue.isPending || !form.formState.isValid}
            >
              {createIssue.isPending ? <Loader className='animate-spin' /> : <Check className='' />}
            </Button>
          </form>
        </Form>
      </TableCell>
    </TableRow>
  );
};

export default function ListContainer({ projectId }: { projectId: string }) {
  const { project } = useProject(projectId);
  const { issues, fetchIssues } = useIssues({ projectId });

  if (fetchIssues.isPending) return <div>Loading issues...</div>;

  return (
    <section className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>{project?.name || 'Project Issues'}</h1>
      <DataTable
        data={issues}
        columns={issueColumns}
        DataTablePagination={DataTablePagination}
        RowCreate={RowCreate}
      />
    </section>
  );
}
