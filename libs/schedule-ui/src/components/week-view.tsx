'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, Maximize, Calendar, Clock } from 'lucide-react';
import clsx from 'clsx';

import { useScheduler } from '../providers/schedular-provider';
import { useModal } from '../providers/modal-context';
import { Event, CustomEventModal } from '../types/schedule';

import { Badge } from '@shadcn-ui/components/badge';
import { AddEventModal } from './add-event-modal';
import { EventStyled } from './event-styled';
import { Button } from '@shadcn-ui/components/button';
import { CustomModal } from './custom-modal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shadcn-ui/components/tooltip';
import { ScrollArea } from '@shadcn-ui/components/scroll-area';

// Animation Variants - moved outside component for better performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.12 } },
};

const pageTransitionVariants = {
  enter: () => ({ opacity: 0 }),
  center: { opacity: 1 },
  exit: () => ({
    opacity: 0,
    transition: { opacity: { duration: 0.2, ease: 'easeInOut' } },
  }),
};

const eventAnimationVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2 },
};

// Helper component for displaying time slots
const TimeSlot = ({
  hour,
  onClick,
  showHoverEffect = true,
}: {
  hour: string;
  onClick?: () => void;
  showHoverEffect?: boolean;
}) => (
  <motion.div
    variants={itemVariants}
    className={clsx(
      'border-b border-default-200 p-[16px] h-[64px] text-center text-sm text-muted-foreground',
      onClick && 'cursor-pointer',
    )}
    onClick={onClick}
  >
    {hour}
    {showHoverEffect && (
      <div className='absolute bg-accent z-40 flex items-center justify-center text-xs opacity-0 transition duration-250 hover:opacity-100 w-full h-full'>
        Add Event
      </div>
    )}
  </motion.div>
);

// Custom hook to generate time labels
const useTimeLabels = () => {
  return useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i % 12 || 12;
      const ampm = i < 12 ? 'AM' : 'PM';
      return `${hour}:00 ${ampm}`;
    });
  }, []);
};

// Custom hook for event grouping logic
const useEventGrouping = (events: Event[] | undefined) => {
  return useMemo(() => {
    if (!events || events.length === 0) return [];

    // Sort events by start time
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    // Precise time overlap checking function
    const eventsOverlap = (event1: Event, event2: Event) => {
      const start1 = new Date(event1.startDate).getTime();
      const end1 = new Date(event1.endDate).getTime();
      const start2 = new Date(event2.startDate).getTime();
      const end2 = new Date(event2.endDate).getTime();

      // Strict time overlap - one event starts before the other ends
      return start1 < end2 && start2 < end1;
    };

    // First, create a graph where events are vertices and edges represent overlaps
    const graph: Record<string, Set<string>> = {};

    // Initialize graph
    for (const event of sortedEvents) {
      graph[event.id] = new Set<string>();
    }

    // Build connections - only connect events that truly overlap in time
    for (let i = 0; i < sortedEvents.length; i++) {
      for (let j = i + 1; j < sortedEvents.length; j++) {
        // Only consider events that actually overlap in time
        if (eventsOverlap(sortedEvents[i], sortedEvents[j])) {
          graph[sortedEvents[i].id].add(sortedEvents[j].id);
          graph[sortedEvents[j].id].add(sortedEvents[i].id);
        }
      }
    }

    // Use DFS to find connected components (groups of overlapping events)
    const visited = new Set<string>();
    const groups: Event[][] = [];

    for (const event of sortedEvents) {
      if (!visited.has(event.id)) {
        // Start a new component/group
        const group: Event[] = [];
        const stack: Event[] = [event];
        visited.add(event.id);

        // DFS traversal
        while (stack.length > 0) {
          const current = stack.pop()!;
          group.push(current);

          // Visit neighbors (overlapping events)
          for (const neighborId of graph[current.id]) {
            if (!visited.has(neighborId)) {
              const neighbor = sortedEvents.find((e) => e.id === neighborId);
              if (neighbor) {
                stack.push(neighbor);
                visited.add(neighborId);
              }
            }
          }
        }

        // Sort this group by start time
        group.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        groups.push(group);
      }
    }

    return groups;
  }, [events]);
};

// Navigation Controls component
const NavigationControls = ({
  onPrev,
  onNext,
  prevButton,
  nextButton,
  classNames,
  currentDate,
}: {
  onPrev: () => void;
  onNext: () => void;
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  classNames?: { prev?: string; next?: string };
  currentDate: Date;
}) => {
  // Format the date range for display
  const dateRangeText = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startFormatted = startOfWeek.toLocaleDateString(undefined, formatOptions);
    const endFormatted = endOfWeek.toLocaleDateString(undefined, formatOptions);

    return `${startFormatted} - ${endFormatted}`;
  }, [currentDate]);

  return (
    <div className='flex items-center justify-between w-full mb-4'>
      <h2 className='text-xl font-semibold flex items-center'>
        <Calendar className='mr-2 h-5 w-5 text-muted-foreground' />
        <span>{dateRangeText}</span>
      </h2>

      <div className='flex gap-3'>
        {prevButton ? (
          <div onClick={onPrev}>{prevButton}</div>
        ) : (
          <Button variant='outline' className={classNames?.prev} onClick={onPrev}>
            <ArrowLeft className='mr-1 h-4 w-4' />
            Previous
          </Button>
        )}
        <Button
          variant='outline'
          onClick={() => {
            const today = new Date();
            // Logic to navigate to current week would go here
          }}
        >
          Today
        </Button>
        {nextButton ? (
          <div onClick={onNext}>{nextButton}</div>
        ) : (
          <Button variant='outline' className={classNames?.next} onClick={onNext}>
            Next
            <ArrowRight className='ml-1 h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
};

// Time cursor component
const TimeCursor = ({ position, time }: { position: number; time: string | null }) => {
  if (!time) return null;

  return (
    <div
      className='absolute left-0 w-full h-[2px] bg-primary/50 rounded-full pointer-events-none z-50'
      style={{ top: `${position}px` }}
    >
      <Badge
        variant='outline'
        className='absolute -translate-y-1/2 bg-background z-50 left-[5px] text-xs shadow-sm border border-primary/30'
      >
        <Clock className='mr-1 h-3 w-3' />
        {time}
      </Badge>
    </div>
  );
};

// Current time indicator component
const CurrentTimeIndicator = ({
  hoursRef,
  currentDate,
  daysOfWeek,
}: {
  hoursRef: React.RefObject<HTMLDivElement>;
  currentDate: Date;
  daysOfWeek: Date[];
}) => {
  const [position, setPosition] = useState<number | null>(null);
  const [dayIndex, setDayIndex] = useState<number | null>(null);

  useEffect(() => {
    const updateCurrentTime = () => {
      if (!hoursRef.current) return;

      const now = new Date();
      const today = now.getDate();

      // Check if today is in the current week view
      const todayIndex = daysOfWeek.findIndex((day) => day.getDate() === today);

      if (todayIndex === -1) {
        setPosition(null);
        setDayIndex(null);
        return;
      }

      // Calculate position based on current time
      const hourHeight = 64; // Height of each hour slot
      const hourFraction = now.getHours() + now.getMinutes() / 60;
      const yPosition = hourFraction * hourHeight;

      setPosition(yPosition);
      setDayIndex(todayIndex);
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [hoursRef, daysOfWeek]);

  if (position === null || dayIndex === null) return null;

  return (
    <div
      className='absolute left-0 right-0 h-[2px] bg-red-500 z-40 pointer-events-none'
      style={{
        top: `${position}px`,
        left: dayIndex === 0 ? '0' : `${(dayIndex / 7) * 100}%`,
        width: `${100 / 7}%`,
      }}
    >
      <div className='absolute -left-1 -top-[4px] w-[8px] h-[8px] rounded-full bg-red-500' />
    </div>
  );
};

// Day Header component
const DayHeader = ({
  day,
  isToday,
  onMaximize,
  getters,
}: {
  day: Date;
  isToday: boolean;
  onMaximize: () => void;
  getters: any;
}) => (
  <div className='sticky top-0 z-20 bg-default-100 flex-grow flex items-center justify-center group'>
    <div className='text-center p-4 w-full'>
      <div className='text-lg font-semibold'>{getters.getDayName(day.getDay())}</div>
      <div
        className={clsx(
          'text-lg font-semibold rounded-full w-8 h-8 flex items-center justify-center mx-auto',
          isToday ? 'bg-primary text-primary-foreground' : '',
        )}
      >
        {day.getDate()}
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className='absolute top-2 right-2 p-1 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent'
              onClick={(e) => {
                e.stopPropagation();
                onMaximize();
              }}
            >
              <Maximize size={14} className='text-muted-foreground hover:text-primary' />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>View full day</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
);

// DayModal component for showing full day view
const DayModal = ({
  day,
  events,
  onClose,
  hours,
  getters,
  handlers,
  CustomEventComponent,
  CustomEventModal,
  onAddEvent,
}: {
  day: Date;
  events: Event[] | undefined;
  onClose: () => void;
  hours: string[];
  getters: any;
  handlers: any;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  onAddEvent: (time: string) => void;
}) => {
  // Calculate time groups for this day's events
  const timeGroups = useEventGrouping(events);

  return (
    <div className='flex flex-col space-y-4 p-4'>
      <div className='flex items-center mb-4'>
        <Button variant='ghost' size='sm' className='mr-2' onClick={onClose}>
          <ChevronLeft className='mr-1' />
          Back
        </Button>
        <h2 className='text-2xl font-bold'>{day.toDateString()}</h2>
      </div>

      {events && events.length > 0 ? (
        <div className='space-y-6'>
          {/* Timeline view */}
          <div className='relative bg-default-50 rounded-lg p-4 min-h-[600px]'>
            <div className='grid grid-cols-[100px_1fr] h-full'>
              {/* Hours column */}
              <div className='flex flex-col'>
                {hours.map((hour, index) => (
                  <div
                    key={`hour-${index}`}
                    className='h-16 p-2 text-sm text-muted-foreground border-r border-b border-default-200'
                  >
                    {hour}
                  </div>
                ))}
              </div>

              {/* Events column */}
              <div className='relative'>
                {/* Hour grid lines */}
                {Array.from({ length: 24 }).map((_, index) => (
                  <div key={`grid-${index}`} className='h-16 border-b border-default-200' />
                ))}

                {/* Display events */}
                <AnimatePresence initial={false}>
                  {events.map((event) => {
                    // Find which time group this event belongs to
                    let eventsInSamePeriod = 1;
                    let periodIndex = 0;

                    for (let i = 0; i < timeGroups.length; i++) {
                      const groupIndex = timeGroups[i].findIndex((e) => e.id === event.id);
                      if (groupIndex !== -1) {
                        eventsInSamePeriod = timeGroups[i].length;
                        periodIndex = groupIndex;
                        break;
                      }
                    }

                    // Get styling for this event
                    const { height, top, left, maxWidth, minWidth } = handlers.handleEventStyling(
                      event,
                      events,
                      {
                        eventsInSamePeriod,
                        periodIndex,
                        adjustForPeriod: true,
                      },
                    );

                    return (
                      <motion.div
                        key={event.id}
                        style={{
                          position: 'absolute',
                          height,
                          top,
                          left,
                          maxWidth: maxWidth || '95%',
                          minWidth: minWidth || '30%',
                          padding: '0 2px',
                          boxSizing: 'border-box',
                        }}
                        {...eventAnimationVariants}
                      >
                        <EventStyled
                          event={{
                            ...event,
                            CustomEventComponent,
                            minmized: true,
                          }}
                          CustomEventModal={CustomEventModal}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Event list */}
          <div className='bg-card rounded-lg p-4 border border-border'>
            <h3 className='text-lg font-semibold mb-4 flex items-center'>
              <Calendar className='mr-2 h-4 w-4 text-muted-foreground' />
              All Events ({events.length})
            </h3>
            <ScrollArea className='h-[300px] pr-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg shadow-sm border-l-4 border-${event.variant} bg-card hover:shadow-md transition-shadow`}
                  >
                    <EventStyled
                      event={{
                        ...event,
                        CustomEventComponent,
                        minmized: false,
                      }}
                      CustomEventModal={CustomEventModal}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      ) : (
        <div className='text-center py-10 text-muted-foreground'>
          <div className='mb-4'>
            <Calendar className='h-12 w-12 mx-auto text-muted-foreground/50' />
          </div>
          <p className='text-lg'>No events scheduled for this day</p>
          <Button
            variant='default'
            className='mt-4'
            onClick={() => {
              onClose();
              onAddEvent('12:00 PM');
            }}
          >
            Add Event
          </Button>
        </div>
      )}
    </div>
  );
};

export function WeeklyView({
  prevButton,
  nextButton,
  CustomEventComponent,
  CustomEventModal,
  classNames,
}: {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  classNames?: { prev?: string; next?: string; addEvent?: string };
}) {
  const { getters, handlers } = useScheduler();
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  const [detailedHour, setDetailedHour] = useState<string | null>(null);
  const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [colWidth, setColWidth] = useState<number[]>(Array(7).fill(1));
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [direction, setDirection] = useState<number>(0);
  const { setOpen } = useModal();

  // Use our custom hooks
  const hours = useTimeLabels();

  // Get days of the week using memoization to prevent recalculation
  const daysOfWeek = useMemo(
    () => getters.getDaysInWeek(getters.getWeekNumber(currentDate), currentDate.getFullYear()),
    [getters, currentDate],
  );

  // Reset column widths when the date changes
  useEffect(() => {
    setColWidth(Array(7).fill(1));
  }, [currentDate]);

  // Handle mouse tracking for time cursor
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!hoursColumnRef.current) return;

    const rect = hoursColumnRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hourHeight = rect.height / 24;
    const hour = Math.max(0, Math.min(23, Math.floor(y / hourHeight)));
    const minuteFraction = (y % hourHeight) / hourHeight;
    const minutes = Math.floor(minuteFraction * 60);

    // Format in 12-hour format
    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    setDetailedHour(`${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`);

    // Calculate timeline position with header offset
    const headerOffset = 83;
    const position = Math.max(0, Math.min(rect.height, Math.round(y))) + headerOffset;
    setTimelinePosition(position);
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setDetailedHour(null);
  }, []);

  // Function to add a new event
  const handleAddEvent = useCallback(
    (event?: Event) => {
      const startDate = event?.startDate || new Date();
      const endDate = event?.endDate || new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour

      setOpen(
        <CustomModal title='Add Event'>
          <AddEventModal CustomAddEventModal={CustomEventModal?.CustomAddEventModal?.CustomForm} />
        </CustomModal>,
        async () => ({
          ...event,
          startDate,
          endDate,
        }),
      );
    },
    [setOpen, CustomEventModal?.CustomAddEventModal?.CustomForm],
  );

  // Handle week navigation
  const handleNextWeek = useCallback(() => {
    setDirection(1);
    setCurrentDate((prevDate) => {
      const nextWeek = new Date(prevDate);
      nextWeek.setDate(prevDate.getDate() + 7);
      return nextWeek;
    });
  }, []);

  const handlePrevWeek = useCallback(() => {
    setDirection(-1);
    setCurrentDate((prevDate) => {
      const prevWeek = new Date(prevDate);
      prevWeek.setDate(prevDate.getDate() - 7);
      return prevWeek;
    });
  }, []);

  // Function to add event on specific day and time
  const handleAddEventWeek = useCallback(
    (dayIndex: number, timeString: string | null) => {
      if (!timeString || !daysOfWeek[dayIndex]) {
        console.error('Invalid time or day');
        return;
      }

      // Parse the 12-hour format time
      const [timePart, ampm] = timeString.split(' ');
      const [hourStr, minuteStr] = timePart.split(':');
      let hours = parseInt(hourStr);
      const minutes = parseInt(minuteStr);

      // Convert to 24-hour format for Date object
      if (ampm === 'PM' && hours < 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }

      const chosenDay = daysOfWeek[dayIndex].getDate();
      const chosenMonth = daysOfWeek[dayIndex].getMonth();
      const chosenYear = daysOfWeek[dayIndex].getFullYear();

      const date = new Date(chosenYear, chosenMonth, chosenDay, hours, minutes);

      handleAddEvent({
        startDate: date,
        endDate: new Date(date.getTime() + 60 * 60 * 1000), // 1-hour duration
        title: '',
        id: '',
        variant: 'primary',
      });
    },
    [daysOfWeek, handleAddEvent],
  );

  // Function to open day detail modal
  const handleOpenDayModal = useCallback(
    (dayIndex: number) => {
      const selectedDay = daysOfWeek[dayIndex];
      if (!selectedDay) return;

      // Get events for the selected day
      const dayEvents = getters.getEventsForDay(selectedDay.getDate(), selectedDay);

      setOpen(
        <CustomModal
          title={`${getters.getDayName(
            selectedDay.getDay(),
          )} ${selectedDay.getDate()}, ${selectedDay.getFullYear()}`}
          className='max-w-4xl'
        >
          <DayModal
            day={selectedDay}
            events={dayEvents}
            onClose={() => setOpen(null)}
            hours={hours}
            getters={getters}
            handlers={handlers}
            CustomEventComponent={CustomEventComponent}
            CustomEventModal={CustomEventModal}
            onAddEvent={(time) => {
              setOpen(null);
              handleAddEventWeek(dayIndex, time);
            }}
          />
        </CustomModal>,
      );
    },
    [
      daysOfWeek,
      getters,
      handlers,
      hours,
      setOpen,
      handleAddEventWeek,
      CustomEventComponent,
      CustomEventModal,
    ],
  );

  return (
    <div className='weekly-view flex flex-col gap-4'>
      <NavigationControls
        onPrev={handlePrevWeek}
        onNext={handleNextWeek}
        prevButton={prevButton}
        nextButton={nextButton}
        classNames={classNames}
        currentDate={currentDate}
      />

      <AnimatePresence initial={false} custom={direction} mode='wait'>
        <motion.div
          key={currentDate.toISOString()}
          custom={direction}
          variants={pageTransitionVariants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{
            opacity: { duration: 0.2 },
          }}
          className='grid grid-cols-8 gap-0 bg-card rounded-lg border border-border overflow-hidden shadow-sm'
        >
          {/* Week number header */}
          <div className='sticky top-0 left-0 z-30 bg-default-100 rounded-tl-lg h-full border-0 flex items-center justify-center bg-primary/5'>
            <span className='text-xl tracking-tight font-semibold'>
              Week {getters.getWeekNumber(currentDate)}
            </span>
          </div>

          {/* Day headers */}
          <div className='col-span-7 flex flex-col relative'>
            <div
              className='grid gap-0 flex-grow bg-primary/5 rounded-r-lg'
              style={{
                gridTemplateColumns: colWidth.map((w) => `${w}fr`).join(' '),
                transition: isResizing ? 'none' : 'grid-template-columns 0.3s ease-in-out',
              }}
            >
              {daysOfWeek.map((day, idx) => {
                const isToday =
                  new Date().getDate() === day.getDate() &&
                  new Date().getMonth() === day.getMonth() &&
                  new Date().getFullYear() === day.getFullYear();

                return (
                  <div key={idx} className='relative group flex flex-col'>
                    <DayHeader
                      day={day}
                      isToday={isToday}
                      onMaximize={() => handleOpenDayModal(idx)}
                      getters={getters}
                    />
                    <div className='absolute top-12 right-0 w-px h-[calc(100%-3rem)]'></div>
                  </div>
                );
              })}
            </div>

            {/* Time cursor */}
            <TimeCursor position={timelinePosition} time={detailedHour} />
          </div>

          {/* Hours column and day grid */}
          <div
            ref={hoursColumnRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className='relative grid grid-cols-8 col-span-8'
          >
            {/* Hours column */}
            <div className='col-span-1 bg-default-50 hover:bg-default-100 transition duration-400 border-r border-border'>
              {hours.map((hour, index) => (
                <TimeSlot key={`hour-${index}`} hour={hour} showHoverEffect={false} />
              ))}
            </div>

            {/* Days grid */}
            <div
              className='col-span-7 bg-default-50 grid h-full'
              style={{
                gridTemplateColumns: colWidth.map((w) => `${w}fr`).join(' '),
                transition: isResizing ? 'none' : 'grid-template-columns 0.3s ease-in-out',
              }}
            >
              {/* Current time indicator */}
              <CurrentTimeIndicator
                hoursRef={hoursColumnRef}
                currentDate={currentDate}
                daysOfWeek={daysOfWeek}
              />

              {/* Day columns */}
              {daysOfWeek.map((day, dayIndex) => {
                const dayEvents = getters.getEventsForDay(day.getDate(), day);

                // Group events by time period
                const timeGroups = useEventGrouping(dayEvents);

                // Get the count of events to determine if we need to show a "more" button
                const eventsCount = dayEvents?.length || 0;
                const maxEventsToShow = 10; // Limit the number of events to display
                const hasMoreEvents = eventsCount > maxEventsToShow;

                // Only show a subset of events if there are too many
                const visibleEvents = hasMoreEvents
                  ? dayEvents?.slice(0, maxEventsToShow - 1)
                  : dayEvents;

                return (
                  <div
                    key={`day-${dayIndex}`}
                    className='col-span-1 border-default-200 z-20 relative transition duration-300 cursor-pointer border-r border-b text-center text-sm text-muted-foreground overflow-hidden hover:bg-default-100/50'
                    onClick={() => {
                      handleAddEventWeek(dayIndex, detailedHour);
                    }}
                  >
                    {/* Events */}
                    <AnimatePresence initial={false}>
                      {visibleEvents?.map((event) => {
                        // Find which time group this event belongs to
                        let eventsInSamePeriod = 1;
                        let periodIndex = 0;

                        for (let i = 0; i < timeGroups.length; i++) {
                          const groupIndex = timeGroups[i].findIndex((e) => e.id === event.id);
                          if (groupIndex !== -1) {
                            eventsInSamePeriod = timeGroups[i].length;
                            periodIndex = groupIndex;
                            break;
                          }
                        }

                        // Get styling for this event
                        const { height, left, maxWidth, minWidth, top, zIndex } =
                          handlers.handleEventStyling(event, dayEvents, {
                            eventsInSamePeriod,
                            periodIndex,
                            adjustForPeriod: true,
                          });

                        return (
                          <motion.div
                            key={event.id}
                            style={{
                              minHeight: height,
                              height,
                              top: top,
                              left: left,
                              maxWidth: maxWidth || '95%',
                              minWidth: minWidth || '30%',
                              padding: '0 2px',
                              boxSizing: 'border-box',
                              zIndex: zIndex || 50,
                            }}
                            className='flex transition-all duration-1000 flex-grow flex-col absolute'
                            {...eventAnimationVariants}
                          >
                            <EventStyled
                              event={{
                                ...event,
                                CustomEventComponent,
                                minmized: true,
                              }}
                              CustomEventModal={CustomEventModal}
                            />
                          </motion.div>
                        );
                      })}

                      {/* "More events" badge */}
                      {hasMoreEvents && (
                        <motion.div
                          key={`more-events-${dayIndex}`}
                          style={{
                            bottom: '10px',
                            right: '10px',
                            position: 'absolute',
                          }}
                          className='z-50'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Badge
                            variant='secondary'
                            className='cursor-pointer hover:bg-accent shadow-sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDayModal(dayIndex);
                            }}
                          >
                            +{eventsCount - (maxEventsToShow - 1)} more
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Hour slots */}
                    {Array.from({ length: 24 }, (_, hourIndex) => (
                      <div
                        key={`day-${dayIndex}-hour-${hourIndex}`}
                        className='h-[64px] relative transition duration-300 border-b border-default-200/50'
                      >
                        <div className='absolute bg-accent/40 z-40 flex items-center justify-center text-xs opacity-0 transition duration-250 hover:opacity-100 w-full h-full'>
                          Add Event
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
