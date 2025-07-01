import { Calendar, MessageSquare, Paperclip, User, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/components/avatar';
import { Badge } from '@shadcn-ui/components/badge';
import { Issue } from '@shared/types/pmms';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
}

const priorityColors = {
  highest: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
  lowest: 'bg-gray-500',
};

const typeIcons = {
  task: 'T',
  story: 'S',
  bug: 'B',
  epic: 'E',
  subtask: 'ST',
};

const statusColors = {
  to_do: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  in_review: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
};

export function IssueCard({ issue, onClick }: IssueCardProps) {
  return (
    <div
      className='bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-sm transition-shadow cursor-pointer'
      onClick={onClick}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center space-x-2 min-w-0 flex-1'>
          <div
            className={`w-6 h-6 rounded text-white text-xs flex items-center justify-center font-bold flex-shrink-0 ${
              issue.type === 'bug'
                ? 'bg-red-500'
                : issue.type === 'story'
                ? 'bg-green-500'
                : 'bg-blue-500'
            }`}
          >
            {typeIcons[issue.type]}
          </div>
          <span className='text-sm text-gray-500 truncate'>{issue.key}</span>
        </div>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[issue.priority]}`} />
      </div>

      {/* Title */}
      <h3 className='font-medium text-gray-900 mb-3 line-clamp-2 text-sm sm:text-base'>
        {issue.title}
      </h3>

      {/* Status badge - mobile only */}
      <div className='sm:hidden mb-3'>
        <Badge variant='outline' className={`text-xs ${statusColors[issue.status]}`}>
          {issue.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className='flex flex-wrap gap-1 mb-3'>
          {issue.labels.slice(0, 2).map((label) => (
            <Badge key={label} variant='outline' className='text-xs'>
              {label}
            </Badge>
          ))}
          {issue.labels.length > 2 && (
            <Badge variant='outline' className='text-xs'>
              +{issue.labels.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className='flex items-center justify-between text-sm text-gray-500'>
        {/* Left side - icons */}
        <div className='flex items-center space-x-2 sm:space-x-3 min-w-0'>
          {issue.attachments.length > 0 && (
            <div className='flex items-center space-x-1'>
              <Paperclip className='w-3 h-3' />
              <span className='hidden sm:inline'>{issue.attachments.length}</span>
            </div>
          )}
          {issue.comments.length > 0 && (
            <div className='flex items-center space-x-1'>
              <MessageSquare className='w-3 h-3' />
              <span className='hidden sm:inline'>{issue.comments.length}</span>
            </div>
          )}
          {issue.dueDate && (
            <div className='flex items-center space-x-1 min-w-0'>
              <Calendar className='w-3 h-3 flex-shrink-0' />
              <span className='hidden md:inline truncate'>
                {new Date(issue.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {issue.estimatedTime && (
            <div className='hidden lg:flex items-center space-x-1'>
              <Clock className='w-3 h-3' />
              <span>{issue.estimatedTime}h</span>
            </div>
          )}
        </div>

        {/* Right side - assignee */}
        <div className='flex-shrink-0'>
          {issue.assignee ? (
            <Avatar className='w-6 h-6'>
              <AvatarImage src={issue.assignee.avatar} />
              <AvatarFallback className='text-xs'>{issue.assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <User className='w-4 h-4 text-gray-400' />
          )}
        </div>
      </div>

      {/* Mobile due date */}
      {issue.dueDate && (
        <div className='md:hidden mt-2 text-xs text-gray-500'>
          Due: {new Date(issue.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
