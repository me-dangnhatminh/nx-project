'use client';

import React from 'react';
import { Classroom, CourseInfo } from '@shared/types/dtutool';
import { Button } from '@shadcn-ui/components/button';
import { Card, CardContent } from '@shadcn-ui/components/card';
import { Calendar, Clock, Users, User, Code, MapPin } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shadcn-ui/components/tooltip';
import { Badge } from './badge';
import { addDays, format, parse, startOfWeek } from 'date-fns';
import { cn } from '@shared/utils';

interface ClassroomItemProps {
  course: CourseInfo;
  classroom: Classroom;
  isSelected: boolean;
  onAddClassroom?: (course: CourseInfo, classroom: Classroom) => void;
}

export const ClassroomItem: React.FC<ClassroomItemProps> = ({
  course,
  classroom,
  isSelected,
  onAddClassroom,
}) => {
  const getStatusVariant = (status: 'Open' | 'Closed' | 'Waitlist') => {
    switch (status) {
      case 'Open':
        return 'success';
      case 'Waitlist':
        return 'warning';
      case 'Closed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Get room info from first session (if available)
  const roomInfo = classroom.schedule.regularSessions[0]?.room;
  const locationInfo = classroom.schedule.regularSessions[0]?.location;

  return (
    <Card
      className={cn(
        'p-0 hover:shadow-md transition-all border',
        isSelected ? 'bg-primary/5 border-primary/30' : 'bg-card/60',
      )}
    >
      <CardContent className='p-3 sm:p-4 flex flex-col gap-2'>
        {/* Header row with class name and status */}
        <div className='flex justify-between items-center gap-2'>
          <span className='font-medium text-xs sm:text-sm line-clamp-1'>{classroom.className}</span>
          <Badge
            variant={getStatusVariant('Open')}
            className='text-[10px] sm:text-xs whitespace-nowrap px-1.5 py-0'
          >
            {classroom.registration.status}
          </Badge>
        </div>

        {/* Class details in responsive grid */}
        <div className={cn('grid grid-cols-2 sm:grid-cols-1 gap-2')}>
          <div className='flex items-center text-[10px] sm:text-xs text-muted-foreground'>
            <Code className='h-3 w-3 mr-1 flex-shrink-0' />
            <span className='truncate'>{classroom.registration.regId}</span>
          </div>

          {classroom.teacher && (
            <div className='flex items-center text-[10px] sm:text-xs text-muted-foreground'>
              <User className='h-3 w-3 mr-1 flex-shrink-0' />
              <span className='truncate'>{classroom?.teacher?.name}</span>
            </div>
          )}

          <div className='flex items-center text-[10px] sm:text-xs text-muted-foreground'>
            <Users className='h-3 w-3 mr-1 flex-shrink-0' />
            <span className='truncate'>
              {classroom.registration.seatsLeft}{' '}
              {classroom.registration.seatsLeft > 1 ? 'seats' : 'seat'} available
            </span>
          </div>

          {roomInfo && (
            <div className='flex items-center text-[10px] sm:text-xs text-muted-foreground'>
              <MapPin className='h-3 w-3 mr-1 flex-shrink-0' />
              <span className='truncate'>
                {roomInfo} {locationInfo && `(${locationInfo})`}
              </span>
            </div>
          )}
        </div>

        <div className={cn('flex items-start', 'mt-1 text-[10px] sm:text-xs')}>
          <Calendar className='h-3 w-3 mr-1 flex-shrink-0' />
          <div
            className={cn(
              'flex flex-col gap-1',
              'text-muted-foreground',
              'line-clamp-3 sm:line-clamp-2',
            )}
          >
            {classroom.schedule.regularSessions.map((session, idx) => {
              // Format day and time info
              const dayName = format(
                addDays(startOfWeek(new Date()), (session.dayOfWeek + 6) % 7),
                'EEE',
              );

              const startTime = format(parse(session.startTime, 'HH:mm', new Date()), 'h:mm a');
              const endTime = format(parse(session.endTime, 'HH:mm', new Date()), 'h:mm a');

              return (
                <div
                  key={idx}
                  className='flex flex-wrap sm:flex-nowrap sm:items-center justify-between gap-1'
                >
                  <span className='font-medium min-w-[40px]'>{dayName}</span>
                  <div className='flex items-center ml-auto'>
                    <Clock className='h-3 w-3 mr-1 flex-shrink-0' />
                    <span>
                      {startTime} - {endTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add button with tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='w-full mt-2'>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelected) return;
                    if (onAddClassroom) {
                      onAddClassroom(course, classroom);
                    }
                  }}
                  disabled={isSelected}
                  variant={!isSelected ? 'default' : 'outline'}
                  className='w-full py-0 h-7 sm:h-8 text-[10px] sm:text-xs cursor-pointer'
                  size='sm'
                >
                  {isSelected ? 'Already Added' : 'Add to My Courses'}
                </Button>
              </div>
            </TooltipTrigger>
            {isSelected && (
              <TooltipContent side='bottom' align='center'>
                <p className='text-xs'>This section is already in your selection</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
