'use client';

import './styles.css';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { SelectedClassroom, ConflictResult, CalendarEvent } from '@shared/types/dtutool';
import { Card, CardContent, CardHeader } from '@shadcn-ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@shadcn-ui/components/dialog';
import { Button } from '@shadcn-ui/components/button';
import { Badge } from '@shadcn-ui/components/badge';
import { Clock, MapPin, AlertTriangle, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { addDays, addWeeks, format, parse } from 'date-fns';
import { EventImpl } from '@fullcalendar/core/internal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';
import { cn } from '@shared/utils';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const CalendarWrapper = dynamic(
  () => import('./calendar-wrapper').then((mod) => mod.CalendarWrapper),
  { ssr: false },
);

// Helper function to generate colors based on course code
function generateCourseColor(courseCode: string): string {
  const colors = [
    '#4285F4', // Blue
    '#34A853', // Green
    '#FBBC05', // Yellow
    '#EA4335', // Red
    '#8E24AA', // Purple
    '#00ACC1', // Cyan
    '#FB8C00', // Orange
    '#607D8B', // Blue Grey
  ];

  // Simple hash function to map course codes to colors
  let hash = 0;
  for (let i = 0; i < courseCode.length; i++) {
    hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

const mapClassroomToEvent = (
  selectedClassrooms: SelectedClassroom[],
  activeClassroomIdxs: boolean[],
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  selectedClassrooms.forEach((classroom, idx) => {
    // Skip non-active classrooms
    if (!activeClassroomIdxs[idx]) return;

    const { registration, className, teacher, schedule, course } = classroom;
    const regId = registration.regId;
    const courseCode = course.courseCode;
    const courseName = course.courseName;

    // Define a color for this course
    const color = generateCourseColor(courseCode);

    const { regularSessions, makeupSessions } = schedule;

    const fristMondayAcademic = classroom.schedule.firstDateOfAcademic;

    // Generate events for regular sessions
    regularSessions.forEach(({ dayOfWeek, startTime, endTime, room, location, excludedWeeks }) => {
      const excludedWeeksSet = new Set(excludedWeeks);

      for (let week = schedule.weeks.from; week <= schedule.weeks.to; week++) {
        if (excludedWeeksSet.has(week)) continue;

        const mondayOfWeek = addWeeks(fristMondayAcademic, week - 1);
        // dayOfWeek is a number from 0 to 6 (0 is Sunday, 6 is Saturday)
        const normalizedDayOfWeek = (dayOfWeek + 7) % 7;
        const offsetDays = normalizedDayOfWeek - 1;
        const dayOfSessionDate = addDays(mondayOfWeek, offsetDays);

        const start = parse(startTime, 'HH:mm', dayOfSessionDate);
        const end = parse(endTime, 'HH:mm', dayOfSessionDate);

        events.push({
          id: `${regId}-r-${dayOfWeek}-${startTime}-${week}`,
          title: `${className}`,
          start,
          end,
          allDay: false,
          classroomId: regId,
          courseId: course.courseId,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            room,
            location,
            isMakeup: false,
            courseCode,
            courseName,
            className,
            teacherName: teacher?.name,
          },
        });
      }
    });

    // Add makeup sessions
    makeupSessions.forEach((session) => {
      const { date, startTime, endTime, room, location } = session;

      // Parse the date and time strings
      const [year, month, day] = date.split('-').map(Number);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      // Create start and end Date objects (month is 0-indexed in JS Date)
      const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
      const endDateTime = new Date(year, month - 1, day, endHour, endMinute);

      events.push({
        id: `${regId}-m-${date}`,
        title: `${courseCode} - ${className} (MAKEUP)`,
        start: startDateTime,
        end: endDateTime,
        allDay: false,
        classroomId: regId,
        courseId: course.courseId,
        backgroundColor: '#e67c73', // Different color for makeup sessions
        borderColor: '#e67c73',
        extendedProps: {
          room,
          location,
          isMakeup: true,
          courseCode,
          courseName,
          className,
          teacherName: teacher?.name,
        },
      });
    });
  });

  return events;
};

interface TabCalendarProps {
  selectedClassrooms: SelectedClassroom[];
  activeClassroomIdxs: boolean[];
  scheduleConflicts: ConflictResult[];
}

export const TabCalendar: React.FC<TabCalendarProps> = ({
  selectedClassrooms,
  activeClassroomIdxs,
  scheduleConflicts,
}) => {
  const [calendarRange, setCalendarRange] = useState<{ start: Date; end: Date } | null>(null);
  const [currentView, setCurrentView] = useState<'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'>(
    'timeGridWeek',
  );
  const calendarRef = useRef<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventImpl | CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const events = useMemo(() => {
    const allEvents = mapClassroomToEvent(selectedClassrooms, activeClassroomIdxs);

    // Mark conflicting events
    if (scheduleConflicts.length > 0) {
      return allEvents.map((event) => {
        // Check if this event is part of a conflict
        const isConflicted = scheduleConflicts.some(
          (conflict) =>
            conflict.regId1 === event.classroomId || conflict.regId2 === event.classroomId,
        );

        if (isConflicted) {
          return {
            ...event,
            backgroundColor: '#FF5252', // Highlight conflicted events
            borderColor: '#FF0000',
            extendedProps: {
              ...event.extendedProps,
              conflicted: true,
            },
          };
        }
        return event;
      });
    }

    return allEvents;
  }, [selectedClassrooms, activeClassroomIdxs, scheduleConflicts]);

  const handleGotoFirstDay = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    let fistDay: Date | null = null;
    events.forEach((event) => {
      const eventStart = new Date(event.start.toString());
      if (!fistDay) fistDay = new Date(eventStart);
      else if (eventStart < fistDay) fistDay = eventStart;
    });
    if (fistDay) calendarApi.gotoDate(fistDay);
  }, [events]);

  const handleGotoLastDay = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    let lastDay: Date | null = null;
    events.forEach((event) => {
      const eventEnd = new Date(event.end.toString());
      if (!lastDay) lastDay = new Date(eventEnd);
      else if (eventEnd > lastDay) lastDay = eventEnd;
    });
    if (lastDay) calendarApi.gotoDate(lastDay);
  }, [events]);

  const todayInRange = useMemo(() => {
    if (!calendarRange) return false;
    const today = new Date();
    return today >= calendarRange.start && today <= calendarRange.end;
  }, [calendarRange]);

  const handleViewChange = (view: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth') => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setCurrentView(view);
    }
  };

  return (
    <Card
      className={cn(
        'w-full h-full max-h-full overflow-hidden',
        'p-2 sm:p-4 gap-2 rounded-lg',
        //
      )}
    >
      <CardHeader className='p-0'>
        <div className='flex flex-wrap gap-1'>
          <Button
            size='sm'
            variant='outline'
            onClick={handleGotoFirstDay}
            className='text-xs sm:text-sm'
          >
            First
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={handleGotoLastDay}
            className='text-xs sm:text-sm'
          >
            Last
          </Button>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-1'>
          <div className='flex-1 flex space-x-1'>
            <Button
              size='sm'
              className='rounded-r-none'
              onClick={() => {
                const calendarApi = calendarRef.current?.getApi();
                if (calendarApi) calendarApi.prev();
              }}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>

            <Button
              size='sm'
              className='rounded-l-none'
              onClick={() => {
                const calendarApi = calendarRef.current?.getApi();
                if (calendarApi) calendarApi.next();
              }}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>

            <Button
              disabled={todayInRange}
              size='sm'
              onClick={() => {
                const calendarApi = calendarRef.current?.getApi();
                if (calendarApi) calendarApi.today();
              }}
              className='text-xs sm:text-sm'
            >
              Today
            </Button>
          </div>

          <div className='hidden sm:block text-center flex-grow'>
            <span className='text-sm sm:text-lg font-semibold truncate'>
              {calendarRef.current?.getApi().view.title || 'Calendar'}
            </span>
          </div>

          <div className='block sm:hidden'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='text-xs'>
                  <Calendar className='h-4 w-4 mr-1' />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleViewChange('timeGridDay')}>
                  Day
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange('timeGridWeek')}>
                  Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange('dayGridMonth')}>
                  Month
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='hidden sm:flex space-x-0.5'>
            {[
              { label: 'Day', value: 'timeGridDay' } as const,
              { label: 'Week', value: 'timeGridWeek' } as const,
              { label: 'Month', value: 'dayGridMonth' } as const,
            ].map((view) => (
              <Button
                key={view.value}
                disabled={currentView === view.value}
                size='sm'
                onClick={() => handleViewChange(view.value)}
              >
                {view.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          'p-0',
          'overflow-auto',
          // FIXME: fix
        )}
      >
        <CalendarWrapper
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView='timeGridWeek'
          headerToolbar={{ left: undefined, center: undefined, right: undefined }}
          events={events}
          datesSet={(dateInfo) => {
            setCalendarRange({ start: dateInfo.start, end: dateInfo.end });
            setCurrentView(calendarRef.current?.getApi().view.type as any);
          }}
          eventClick={(info) => {
            setSelectedEvent(info.event);
            setIsEventDialogOpen(true);
          }}
          slotMinTime='06:00'
          slotMaxTime='22:00'
          allDaySlot={false}
          firstDay={1}
          dayCellClassNames='text-sm'
          height='auto'
          contentHeight='auto'
          /* Add these properties for better mobile support */
          stickyHeaderDates={true}
          nowIndicator={true}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
        />
      </CardContent>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className='sm:max-w-md max-w-[95vw] rounded-lg p-4 sm:p-6'>
          <DialogHeader>
            <DialogTitle className='flex flex-wrap items-center gap-2'>
              <span className='break-words'>
                {selectedEvent?.extendedProps?.courseCode} -{' '}
                {selectedEvent?.extendedProps?.className}
              </span>
              {selectedEvent?.extendedProps?.isMakeup && (
                <Badge variant='destructive' className='mt-1'>
                  Makeup Session
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className='mt-1 break-words'>
              {selectedEvent?.extendedProps?.courseName}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-3 py-4'>
            {selectedEvent?.extendedProps?.teacherName && (
              <div className='flex flex-col sm:flex-row sm:items-start'>
                <span className='text-muted-foreground sm:min-w-[100px] font-medium'>
                  Instructor:
                </span>
                <span className='mt-1 sm:mt-0'>{selectedEvent.extendedProps.teacherName}</span>
              </div>
            )}

            <div className='flex items-center mt-1'>
              <Clock className='w-4 h-4 mr-2 text-muted-foreground flex-shrink-0' />
              <span className='break-words'>
                {selectedEvent &&
                  `${format(new Date(selectedEvent.start as any), 'h:mm a')} - ${format(
                    new Date(selectedEvent.end as any),
                    'h:mm a',
                  )}`}
              </span>
            </div>

            {selectedEvent?.extendedProps?.room && (
              <div className='flex items-start'>
                <MapPin className='w-4 h-4 mr-2 text-muted-foreground mt-1 flex-shrink-0' />
                <span className='break-words'>
                  Room {selectedEvent.extendedProps.room}
                  {selectedEvent.extendedProps.location &&
                    ` (${selectedEvent.extendedProps.location})`}
                </span>
              </div>
            )}

            {selectedEvent?.extendedProps?.conflicted && (
              <div className='mt-2 p-2 bg-destructive/10 rounded flex items-center'>
                <AlertTriangle className='w-4 h-4 mr-2 text-destructive flex-shrink-0' />
                <span className='text-destructive text-sm'>
                  This session conflicts with another course
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEventDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TabCalendar;
