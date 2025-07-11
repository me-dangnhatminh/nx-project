import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import React, { useState, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
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

import BoardColumn, { Column } from './board-column';
import IssueDetailSheet from './issue-detail';
import { Issue } from './in-type';

// Types for API integration
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

interface CreateStatusData {
  name: string;
  description?: string;
  color?: string;
}

interface APIStatus {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  sequence: number;
}

interface APIIssue {
  id: string;
  key: string;
  summary: string;
  description: string | null;
  typeId: string;
  statusId: string;
  priorityId: string;
  projectId: string;
  creatorId: string;
  reporterId: string | null;
  assigneeId: string | null;
  dueDate: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  creator: any;
  reporter: any;
  assignee: any;
  type: any;
  status: any;
  priority: any;
}

interface CreateStatusDialogProps {
  onCreateStatus: (statusData: CreateStatusData) => Promise<void>;
  isLoading?: boolean;
}

const CreateStatusDialog: React.FC<CreateStatusDialogProps> = ({
  onCreateStatus,
  isLoading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [statusName, setStatusName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!statusName.trim() || submitting) return;

      setSubmitting(true);
      try {
        await onCreateStatus({
          name: statusName.trim(),
          description: description.trim() || undefined,
          color: color,
        });

        // Reset form
        setStatusName('');
        setDescription('');
        setColor('#6B7280');
        setOpen(false);
      } catch (error) {
        console.error('Error creating status:', error);
        // Keep dialog open on error
      } finally {
        setSubmitting(false);
      }
    },
    [statusName, description, color, onCreateStatus, submitting],
  );

  const handleCancel = useCallback(() => {
    if (!submitting) {
      setStatusName('');
      setDescription('');
      setColor('#6B7280');
      setOpen(false);
    }
  }, [submitting]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='flex items-center gap-2 bg-white hover:bg-gray-50 border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200'
          disabled={isLoading}
        >
          <Plus className='w-4 h-4' />
          Add Status
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleSubmit}>
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
                id='name'
                value={statusName}
                onChange={(e) => setStatusName(e.target.value)}
                className='col-span-3'
                placeholder='Enter status name'
                disabled={submitting}
                autoFocus
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='description' className='text-right'>
                Description
              </Label>
              <Input
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='col-span-3'
                placeholder='Optional description'
                disabled={submitting}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='color' className='text-right'>
                Color
              </Label>
              <div className='col-span-3 flex items-center gap-2'>
                <input
                  type='color'
                  id='color'
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className='w-12 h-8 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed'
                  disabled={submitting}
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className='flex-1'
                  placeholder='#6B7280'
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type='submit' disabled={!statusName.trim() || submitting}>
              {submitting ? 'Creating...' : 'Create Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const BoardContainer: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [statuses, setStatuses] = useState<APIStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    // Set the current user cookie for API authentication
    document.cookie = `x-user-id=me-dangnhatminh; path=/; SameSite=Lax`;
  }, []);

  // API Helper functions
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'API call failed');
    }

    return result.data;
  };

  // Convert API issue to UI issue format
  const convertAPIIssueToUIIssue = (apiIssue: APIIssue): Issue => {
    return {
      id: apiIssue.id,
      title: apiIssue.summary,
      key: apiIssue.key,
      description: apiIssue.description || '',
      priority: apiIssue.priority?.name?.toLowerCase() || 'medium',
      status: apiIssue.status?.name || 'TO DO',
      assignee: apiIssue.assignee
        ? {
            id: apiIssue.assignee.id,
            name: `${apiIssue.assignee.firstName} ${apiIssue.assignee.lastName}`,
            email: apiIssue.assignee.email,
            avatar: apiIssue.assignee.avatar?.fileName || '',
          }
        : undefined,
      reporter: apiIssue.reporter
        ? {
            id: apiIssue.reporter.id,
            name: `${apiIssue.reporter.firstName} ${apiIssue.reporter.lastName}`,
            email: apiIssue.reporter.email,
            avatar: apiIssue.reporter.avatar?.fileName || '',
          }
        : undefined,
      dueDate: apiIssue.dueDate ? new Date(apiIssue.dueDate) : undefined,
      createdAt: apiIssue.createdAt,
      updatedAt: apiIssue.updatedAt,
      activities: [],
    };
  };

  // Generate unique issue key
  const generateIssueKey = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TASK-${timestamp}-${random}`;
  }, []);

  // Load project data (issues and statuses)
  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const projectData = await apiCall(`/api/projects/${projectId}/view/board`);
      const { statuses: apiStatuses, issues: apiIssues } = projectData;

      // Set statuses
      setStatuses(apiStatuses);

      // Convert API issues to UI format
      const uiIssues = apiIssues.map(convertAPIIssueToUIIssue);

      // Group issues by status
      const statusGroups: { [key: string]: Issue[] } = {};

      // Initialize with API statuses
      apiStatuses.forEach((status: APIStatus) => {
        statusGroups[status.name] = [];
      });

      // Group existing issues by their status
      uiIssues.forEach((issue: Issue) => {
        const statusName = issue.status || 'TO DO';
        if (!statusGroups[statusName]) {
          statusGroups[statusName] = [];
        }
        statusGroups[statusName].push(issue);
      });

      // Create columns from status groups
      const newColumns: Column[] = apiStatuses.map((status: APIStatus) => ({
        id: status.id,
        title: status.name,
        description: status.description || `${status.name} tasks`,
        color: status.color || undefined,
        issues: statusGroups[status.name] || [],
      }));

      setColumns(newColumns);
    } catch (err) {
      console.error('Error loading project data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load project data on component mount
  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId, loadProjectData]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, type } = result;

      if (!destination) return;

      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      if (type === 'column') {
        // Handle column reordering
        const newColumns = Array.from(columns);
        const [movedColumn] = newColumns.splice(source.index, 1);
        newColumns.splice(destination.index, 0, movedColumn);

        // Update local state immediately for UI responsiveness
        setColumns(newColumns);

        try {
          // Save new order to database
          const statusIds = newColumns.map((col) => col.id);
          await apiCall('/api/statuses/reorder', {
            method: 'POST',
            body: JSON.stringify({ statusIds }),
          });

          console.log('Column order saved successfully');
        } catch (error) {
          console.error('Error saving column order:', error);

          // Revert to original order on error
          loadProjectData();

          // You might want to show a toast notification here
          alert('Failed to save column order. Changes have been reverted.');
        }
        return;
      }

      // Handle issue drag & drop (existing logic)
      const sourceColumn = columns.find((col) => col.id === source.droppableId);
      const destColumn = columns.find((col) => col.id === destination.droppableId);

      if (!sourceColumn || !destColumn) return;

      if (source.droppableId === destination.droppableId) {
        // Moving within the same column
        const newIssues = Array.from(sourceColumn.issues);
        const [movedIssue] = newIssues.splice(source.index, 1);
        newIssues.splice(destination.index, 0, movedIssue);

        setColumns((prevColumns) =>
          prevColumns.map((col) =>
            col.id === sourceColumn.id ? { ...col, issues: newIssues } : col,
          ),
        );
      } else {
        // Moving between different columns
        const sourceIssues = Array.from(sourceColumn.issues);
        const destIssues = Array.from(destColumn.issues);
        const [movedIssue] = sourceIssues.splice(source.index, 1);

        // Update issue status via API
        try {
          await apiCall(`/api/issues/${movedIssue.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              statusId: destColumn.id,
            }),
          });

          // Update local state
          const updatedIssue = { ...movedIssue, status: destColumn.title };
          destIssues.splice(destination.index, 0, updatedIssue);

          setColumns((prevColumns) =>
            prevColumns.map((col) => {
              if (col.id === sourceColumn.id) {
                return { ...col, issues: sourceIssues };
              }
              if (col.id === destColumn.id) {
                return { ...col, issues: destIssues };
              }
              return col;
            }),
          );
        } catch (error) {
          console.error('Error updating issue status:', error);
          // Revert the move on error
          loadProjectData();
          alert('Failed to update issue status. Changes have been reverted.');
        }
      }
    },
    [columns, loadProjectData],
  );

  const handleIssueClick = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
    setSheetOpen(true);
  }, []);

  const handleIssueCreate = useCallback(async (columnId: string, issueData: CreateIssueData) => {
    try {
      const newIssue = await apiCall('/api/issues', {
        method: 'POST',
        body: JSON.stringify(issueData),
      });

      const uiIssue = convertAPIIssueToUIIssue(newIssue);

      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === columnId ? { ...col, issues: [...col.issues, uiIssue] } : col,
        ),
      );
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  }, []);

  const handleIssueDelete = useCallback(async (issueId: string, columnId: string) => {
    try {
      await apiCall(`/api/issues/${issueId}`, {
        method: 'DELETE',
      });

      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === columnId
            ? { ...col, issues: col.issues.filter((issue) => issue.id !== issueId) }
            : col,
        ),
      );
    } catch (error) {
      console.error('Error deleting issue:', error);
    }
  }, []);

  const handleIssueUpdate = useCallback(async (updatedIssue: Issue) => {
    try {
      await apiCall(`/api/issues/${updatedIssue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          summary: updatedIssue.title,
          description: updatedIssue.description,
          assigneeId: updatedIssue.assignee?.id,
          dueDate: updatedIssue.dueDate?.toISOString(),
        }),
      });

      setColumns((prevColumns) =>
        prevColumns.map((col) => ({
          ...col,
          issues: col.issues.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)),
        })),
      );
      setSelectedIssue(updatedIssue);
    } catch (error) {
      console.error('Error updating issue:', error);
    }
  }, []);

  const handleCreateStatus = useCallback(async (statusData: CreateStatusData) => {
    try {
      const newStatus = await apiCall('/api/statuses', {
        method: 'POST',
        body: JSON.stringify(statusData),
      });

      // Add new status to statuses list
      setStatuses((prev) => [...prev, newStatus]);

      // Add new column
      const newColumn: Column = {
        id: newStatus.id,
        title: newStatus.name,
        description: newStatus.description || `${newStatus.name} tasks`,
        color: newStatus.color || undefined,
        issues: [],
      };

      setColumns((prevColumns) => [...prevColumns, newColumn]);
    } catch (error) {
      console.error('Error creating status:', error);
      throw error;
    }
  }, []);

  const handleColumnRename = useCallback(async (columnId: string, newName: string) => {
    try {
      await apiCall(`/api/statuses/${columnId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName }),
      });

      setColumns((prevColumns) =>
        prevColumns.map((col) => (col.id === columnId ? { ...col, title: newName } : col)),
      );

      setStatuses((prev) =>
        prev.map((status) => (status.id === columnId ? { ...status, name: newName } : status)),
      );
    } catch (error) {
      console.error('Error renaming status:', error);
    }
  }, []);

  const handleColumnDelete = useCallback(async (columnId: string) => {
    try {
      await apiCall(`/api/statuses/${columnId}`, {
        method: 'DELETE',
      });

      setColumns((prevColumns) => prevColumns.filter((col) => col.id !== columnId));
      setStatuses((prev) => prev.filter((status) => status.id !== columnId));
    } catch (error) {
      console.error('Error deleting status:', error);
      // You might want to show a toast notification here
    }
  }, []);

  if (loading) {
    return (
      <div className='w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading project board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
            <p className='font-medium'>Error loading project board</p>
            <p className='text-sm'>{error}</p>
          </div>
          <Button onClick={loadProjectData} className='mt-4'>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Project Board</h1>
          <CreateStatusDialog onCreateStatus={handleCreateStatus} isLoading={loading} />
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId='all-columns' direction='horizontal' type='column'>
            {(provided, snapshot) => (
              <div
                className={`
                  w-full flex overflow-x-auto pb-4
                  ${snapshot.isDraggingOver ? 'bg-blue-100' : ''}
                `}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {columns.map((column, index) => (
                  <Draggable key={column.id} draggableId={column.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          ${snapshot.isDragging ? 'transform rotate-3 shadow-xl' : ''}
                        `}
                      >
                        <BoardColumn
                          column={column}
                          projectId={projectId}
                          index={index}
                          onIssueClick={handleIssueClick}
                          onIssueCreate={handleIssueCreate}
                          onIssueUpdate={handleIssueUpdate}
                          onIssueDelete={handleIssueDelete}
                          onColumnRename={handleColumnRename}
                          onColumnDelete={handleColumnDelete}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Issue Detail Sheet */}
        <IssueDetailSheet
          issue={selectedIssue}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onUpdate={handleIssueUpdate}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default BoardContainer;
