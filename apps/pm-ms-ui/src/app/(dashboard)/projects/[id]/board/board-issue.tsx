import { Draggable } from '@hello-pangea/dnd';
import React, { useCallback } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/components/avatar';
import { format } from 'date-fns';

export interface Issue {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  dueDate?: Date;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface BoardIssueProps {
  issue: Issue;
  index: number;
  columnId: string;
  onClick?: (issue: Issue) => void;
  onUpdate?: (issue: Issue) => void;
  onDelete?: (issueId: string, columnId: string) => void;
}

export const BoardIssue: React.FC<BoardIssueProps> = ({
  issue,
  index,
  columnId,
  onClick,
  onUpdate,
  onDelete,
}) => {
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(issue.id, columnId);
    },
    [issue.id, columnId, onDelete],
  );

  const handleClick = useCallback(() => {
    onClick?.(issue);
  }, [issue, onClick]);

  return (
    <Draggable draggableId={issue.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            issue bg-white border border-gray-200 p-3 rounded-lg mb-2 cursor-pointer 
            shadow-sm hover:shadow-md transition-shadow duration-200
            ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
          `}
          onClick={handleClick}
        >
          <div className='flex justify-between items-start mb-2'>
            <h3 className='font-semibold text-gray-800 text-sm line-clamp-2'>{issue.title}</h3>
            <button
              className='text-gray-400 hover:text-red-500 transition-colors duration-200 ml-2 flex-shrink-0'
              onClick={handleDelete}
              title='Delete issue'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
            </button>
          </div>

          {issue.description && (
            <p className='text-gray-600 text-xs mb-2 line-clamp-3'>{issue.description}</p>
          )}

          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              {issue.priority && (
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
              )}
              {issue.dueDate && (
                <span className='text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded border border-orange-300'>
                  {format(new Date(issue.dueDate), 'MMM dd, yyyy')}
                </span>
              )}
            </div>

            {issue.assignee && (
              <Avatar className='w-6 h-6'>
                <AvatarImage src={issue.assignee.avatar} alt={issue.assignee.name} />
                <AvatarFallback className='text-xs'>
                  {issue.assignee.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default BoardIssue;
