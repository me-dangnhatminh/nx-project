import React from 'react';
import { SelectedClassroom } from '@/lib/types';
import { X } from 'lucide-react';
import { Checkbox } from '@ui/components/checkbox';
import { Button } from '@ui/components/button';
import { Badge } from '@ui/components/badge';
import { Card } from '@ui/components/card';

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
      className={`p-2 border ${
        isConflicted && isActive
          ? 'border-destructive/50 bg-destructive/10'
          : isActive
          ? 'border-primary/30 bg-primary/5'
          : 'border-border'
      }`}
    >
      <div className='flex justify-between items-start'>
        <div className='flex items-start gap-2'>
          <Checkbox
            id={`course-${regId}`}
            checked={isActive}
            onCheckedChange={(checked) => {
              if (onActiveChange) onActiveChange(Boolean(checked));
            }}
            className='mt-1'
          />
          <div>
            <label htmlFor={`course-${regId}`} className='font-medium text-sm cursor-pointer'>
              {course.courseCode} - {classroom.className}
              {isConflicted && isActive && (
                <Badge variant='destructive' className='ml-2 text-xs'>
                  Conflict
                </Badge>
              )}
            </label>
            <div className='text-xs text-muted-foreground'>{course.credits} credits</div>
            {classroom.teacher && (
              <div className='text-xs text-muted-foreground'>{classroom.teacher.name}</div>
            )}
          </div>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 text-muted-foreground hover:text-destructive'
          onClick={() => onRemoveClassroom && onRemoveClassroom(regId)}
        >
          <X className='h-4 w-4' />
          <span className='sr-only'>Remove course</span>
        </Button>
      </div>
    </Card>
  );
};
