import React from 'react';
import { SelectedClassroom } from '@shared/types/dtutool';
import { X, AlertCircle } from 'lucide-react';
import { Checkbox } from '@shadcn-ui/components/checkbox';
import { Button } from '@shadcn-ui/components/button';
import { Badge } from '@shadcn-ui/components/badge';
import { Card } from '@shadcn-ui/components/card';
import { cn } from '@shared/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shadcn-ui/components/tooltip';

interface CourseListItemProps {
  seletedClassroom: SelectedClassroom;
  isActive: boolean;
  isConflicted: boolean;
  onActiveChange?: (checked: boolean) => void;
  onRemoveClassroom?: (classroomId: string) => void;
}

export const CourseListItem: React.FC<CourseListItemProps> = ({
  seletedClassroom,
  isActive,
  isConflicted,
  onActiveChange,
  onRemoveClassroom,
}) => {
  const classroom = seletedClassroom;
  const course = classroom.course;
  const regId = classroom.registration.regId;

  return (
    <Card
      className={cn(
        'p-1.5 sm:p-2 transition-colors',
        'sm:rounded-lg',
        isConflicted && isActive
          ? 'border-destructive/50 bg-destructive/10'
          : isActive
          ? 'border-primary/30 bg-primary/5'
          : 'border-border',
      )}
    >
      <div className='flex justify-between items-start gap-1'>
        <div className='flex items-start gap-1.5 sm:gap-2 flex-1 min-w-0'>
          <Checkbox
            id={`course-${regId}`}
            checked={isActive}
            onCheckedChange={(checked) => {
              if (onActiveChange) onActiveChange(Boolean(checked));
            }}
            className='mt-0.5 sm:mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4'
          />
          <div className='flex-1 min-w-0'>
            <div className='flex items-center flex-wrap gap-x-1 gap-y-0.5'>
              <label
                htmlFor={`course-${regId}`}
                className='font-medium text-xs sm:text-sm cursor-pointer truncate'
                title={`${course.courseCode} - ${classroom.className}`}
              >
                {course.courseCode} - {classroom.className}
              </label>

              {isConflicted && isActive && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant='destructive'
                        className='ml-0.5 text-[10px] sm:text-xs h-4 sm:h-5 px-1 py-0'
                      >
                        <AlertCircle className='h-2 w-2 mr-0.5' />
                        Conflict
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-xs'>This course conflicts with another selected course</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className='text-[10px] sm:text-xs text-muted-foreground truncate'>
              {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
              {classroom.teacher?.name && ` • ${classroom.teacher.name}`}
            </div>
          </div>
        </div>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-destructive flex-shrink-0'
                onClick={() => onRemoveClassroom && onRemoveClassroom(regId)}
              >
                <X className='h-3 w-3 sm:h-4 sm:w-4' />
                <span className='sr-only'>Remove course</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side='left'>
              <p className='text-xs'>Remove from selection</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
};
