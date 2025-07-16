import { Draggable } from '@hello-pangea/dnd';
import React from 'react';
import { format } from 'date-fns';
import { useMutation } from '@tanstack/react-query';
import { Loader, Trash2 } from 'lucide-react';
import { cn } from '@shared/utils';
import { toast } from 'sonner';
import { issueApi } from 'apps/pm-ms-ui/src/lib/api/issue';
import { Issue } from 'apps/pm-ms-ui/src/lib/types';

export interface BoardIssueProps {
  issue: Issue;
  index: number;
  columnId: string;
}

export const BoardIssue: React.FC<BoardIssueProps> = ({ issue, index }) => {
  const deleteIssue = useMutation({
    mutationFn: async (issueId: string) => {
      return issueApi.delete(issue.projectId, issueId);
    },
    onSuccess: () => {
      toast.success('Issue deleted successfully');
    },
  });

  return (
    <Draggable draggableId={issue.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'issue bg-white border border-gray-200 p-3 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200',
            snapshot.isDragging ? 'shadow-lg rotate-2' : '',
          )}
        >
          <div className='flex justify-between items-center'>
            <h3 className='font-semibold text-gray-800 text-sm line-clamp-2'>{issue.summary}</h3>
            {deleteIssue.isPending ? (
              <Loader className='h-4 w-4 text-gray-400 animate-spin' aria-label='Deleting issue' />
            ) : (
              <Trash2
                className='h-4 w-4 text-gray-400 hover:text-red-500 transition-colors duration-200'
                onClick={(e) => {
                  e.stopPropagation();
                  deleteIssue.mutate(issue.id);
                }}
                aria-label='Delete issue'
              />
            )}
          </div>

          {issue.description && (
            <p className='text-gray-600 text-xs mb-2 line-clamp-3'>{issue.description}</p>
          )}

          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              {/* {issue.priority && (
                <span
                  className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${issue.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
                  ${issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${issue.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                `}
                >
                  {issue.priority}
                </span>
              )} */}
              {issue.dueDate && (
                <span className='text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded border border-orange-300'>
                  {format(new Date(issue.dueDate), 'MMM dd, yyyy')}
                </span>
              )}
            </div>

            {/* {issue.assignee && (
              <Avatar className='w-6 h-6'>
                <AvatarImage src={issue.assignee.avatar} alt={issue.assignee.name} />
                <AvatarFallback className='text-xs'>
                  {issue.assignee.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            )} */}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default BoardIssue;
