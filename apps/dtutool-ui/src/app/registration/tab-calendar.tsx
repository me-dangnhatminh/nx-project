'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { SelectedClassroom, ConflictResult, CalendarEvent } from '@/lib/types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent } from '@ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@ui/components/dialog';
import { Button } from '@ui/components/button';
import { Badge } from '@ui/components/badge';
import { Clock, MapPin, AlertTriangle } from 'lucide-react';
import { addDays, addWeeks, format, parse } from 'date-fns';
import { EventImpl } from '@fullcalendar/core/internal';

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

    // weeks when monday is first of week

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
          title: `${courseCode} - ${className}`,
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
  const calendarRef = useRef<FullCalendar>(null);
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

  const handleGotoFirstDay = useCallback(
    () => {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) return;
      let fistDay: Date | null = null;
      events.forEach((event) => {
        const eventStart = new Date(event.start.toString());
        if (!fistDay) fistDay = new Date(eventStart);
        else if (eventStart < fistDay) fistDay = eventStart;
      });
      if (fistDay) calendarApi.gotoDate(fistDay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calendarRef.current, events],
  );

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarRef.current, events]);

  return (
    <Card className="w-full h-full">
      <CardContent className="space-y-2">
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleGotoFirstDay}>
            Start Semester
          </Button>
          <Button size="sm" variant="outline" onClick={handleGotoLastDay}>
            End Semester
          </Button>
        </div>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          eventClick={(info) => {
            if (!!selectedEvent) return;
            setSelectedEvent(info.event);
            setIsEventDialogOpen(true);
          }}
          slotMinTime="08:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          firstDay={1}
          height="auto"
          aspectRatio={1.5}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }}
          eventDidMount={(info) => {
            if (info.event.extendedProps.conflicted) {
              info.el.style.cursor = 'pointer';
              info.el.classList.add('conflict-event');

              // Add a small indicator for conflicts
              const dotElement = document.createElement('span');
              dotElement.className = 'conflict-indicator';
              dotElement.innerHTML = ' ⚠️';
              const titleEl = info.el.querySelector('.fc-event-title');
              if (titleEl) {
                titleEl.appendChild(dotElement);
              }
            }
          }}
        />

        {/* Event Details Dialog */}
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent?.extendedProps?.courseCode} -{' '}
                {selectedEvent?.extendedProps?.className}
                {selectedEvent?.extendedProps?.isMakeup && (
                  <Badge variant="destructive" className="ml-2">
                    Makeup Session
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>{selectedEvent?.extendedProps?.courseName}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4">
              {selectedEvent?.extendedProps?.teacherName && (
                <div className="flex items-start">
                  <span className="text-muted-foreground min-w-[100px]">Instructor:</span>
                  <span>{selectedEvent.extendedProps.teacherName}</span>
                </div>
              )}

              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>
                  {selectedEvent &&
                    `${`${format(selectedEvent?.start || '', 'h:mm a')} - ${format(
                      selectedEvent?.end || '',
                      'h:mm a',
                    )}`}`}
                </span>
              </div>

              {selectedEvent?.extendedProps?.room && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>
                    Room {selectedEvent.extendedProps.room}
                    {selectedEvent.extendedProps.location &&
                      ` (${selectedEvent.extendedProps.location})`}
                  </span>
                </div>
              )}

              {selectedEvent?.extendedProps?.conflicted && (
                <div className="mt-2 p-2 bg-destructive/10 rounded flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-destructive" />
                  <span className="text-destructive text-sm">
                    This session conflicts with another course
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TabCalendar;
