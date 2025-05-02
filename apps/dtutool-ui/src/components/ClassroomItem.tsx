'use client';

import React from 'react';
import { Classroom, CourseInfo } from '@/lib/types';
import { Button } from '@ui/components/button';
import { Card, CardContent } from '@ui/components/card';
import { Calendar, Clock, Users, User, Code } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/components/tooltip';
import { Badge } from './badge';
import { addDays, format, parse, startOfWeek } from 'date-fns';

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

  return (
    <Card
      className={`hover:shadow-md transition-all ${
        isSelected ? 'bg-primary/5 border-primary/30' : 'bg-card/60'
      }`}
    >
      <CardContent className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">{classroom.className}</span>
          <Badge variant={getStatusVariant('Open')} className="text-xs">
            {classroom.registration.status}
          </Badge>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Code className="h-3 w-3 mr-1" />
            <span className="text-xs text-muted-foreground">{classroom.registration.regId}</span>
          </div>

          <div
            hidden={!classroom.teacher}
            className="flex items-center text-xs text-muted-foreground"
          >
            <User className="h-3 w-3 mr-1" />
            {classroom?.teacher?.name}
          </div>

          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            <span>
              {classroom.registration.seatsLeft}{' '}
              {classroom.registration.seatsLeft > 1 ? 'seats' : 'seat'} available
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs">
          <div className="flex items-start">
            <Calendar className="h-3 w-3 mr-1 mt-0.5" />
            <div className="space-y-1 flex-1">
              {classroom.schedule.regularSessions.map((session, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span>
                    {format(addDays(startOfWeek(new Date()), (session.dayOfWeek + 6) % 7), 'EEEE')}
                  </span>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {format(parse(session.startTime, 'HH:mm', new Date()), 'h:mm a')}
                      {' - '}
                      {format(parse(session.endTime, 'HH:mm', new Date()), 'h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
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
                  className="mt-3 w-full py-1 h-8 text-xs cursor-pointer"
                >
                  {isSelected ? 'Already Added' : 'Add to My Courses'}
                </Button>
              </div>
            </TooltipTrigger>
            {isSelected && (
              <TooltipContent>
                <p>This section is already in your selection</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
