'use client';

import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CustomEventModal, Event } from '../../types/schedule';

import { Button } from '@shadcn-ui/components/button';
import { Badge } from '@shadcn-ui/components/badge';

import { useScheduler } from '../../providers/schedular-provider';
import { useModal } from '../../providers/modal-context';

import { AddEventModal } from '../add-event-modal';
import { EventStyled } from '../event-styled';
import { CustomModal } from '../custom-modal';

// Animation variants - moved out of component for better performance
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
  enter: () => ({
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: () => ({
    opacity: 0,
    transition: {
      opacity: { duration: 0.2, ease: 'easeInOut' },
    },
  }),
};

const eventAnimationVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2 },
};

// Component to generate time labels
const HourLabel = ({ hour }: { hour: number }) => {
  const hour12 = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return <>{`${hour12}:00 ${ampm}`}</>;
};

// Custom hook for time grouping
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

      return start1 < end2 && start2 < end1;
    };

    // Use a graph-based approach to find connected components
    const adjacencyList: Record<string, string[]> = {};

    // Initialize graph
    sortedEvents.forEach((event) => {
      adjacencyList[event.id] = [];
    });

    // Build connections
    for (let i = 0; i < sortedEvents.length; i++) {
      for (let j = i + 1; j < sortedEvents.length; j++) {
        if (eventsOverlap(sortedEvents[i], sortedEvents[j])) {
          adjacencyList[sortedEvents[i].id].push(sortedEvents[j].id);
          adjacencyList[sortedEvents[j].id].push(sortedEvents[i].id);
        }
      }
    }

    // Find connected components using DFS
    const visited: Record<string, boolean> = {};
    const components: Event[][] = [];

    const dfs = (nodeId: string, component: string[]) => {
      visited[nodeId] = true;
      component.push(nodeId);

      for (const neighbor of adjacencyList[nodeId]) {
        if (!visited[neighbor]) {
          dfs(neighbor, component);
        }
      }
    };

    // Process each event to find all connected components
    for (const event of sortedEvents) {
      if (!visited[event.id]) {
        const component: string[] = [];
        dfs(event.id, component);

        // Map IDs back to events
        const eventGroup = component
          .map((id) => sortedEvents.find((e) => e.id === id)!)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        components.push(eventGroup);
      }
    }

    return components;
  }, [events]);
};

// Custom hook for time navigation
const useTimeNavigation = (initialDate = new Date()) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [direction, setDirection] = useState<number>(0);

  const handleNextDay = useCallback(() => {
    setDirection(1);
    setCurrentDate((prevDate) => {
      const nextDay = new Date(prevDate);
      nextDay.setDate(prevDate.getDate() + 1);
      return nextDay;
    });
  }, []);

  const handlePrevDay = useCallback(() => {
    setDirection(-1);
    setCurrentDate((prevDate) => {
      const prevDay = new Date(prevDate);
      prevDay.setDate(prevDate.getDate() - 1);
      return prevDay;
    });
  }, []);

  const formattedDayTitle = useMemo(() => currentDate.toDateString(), [currentDate]);

  return {
    currentDate,
    direction,
    handleNextDay,
    handlePrevDay,
    formattedDayTitle,
  };
};

// Sub-component for the timeline cursor
const TimelineCursor = ({ position, time }: { position: number; time: string | null }) => {
  if (!time) return null;

  return (
    <div
      className='absolute left-[50px] w-[calc(100%-53px)] h-[2px] bg-primary/40 rounded-full pointer-events-none'
      style={{ top: `${position}px` }}
    >
      <Badge
        variant='outline'
        className='absolute -translate-y-1/2 bg-white z-50 left-[-20px] text-xs'
      >
        {time}
      </Badge>
    </div>
  );
};

// Sub-component for navigation controls
const NavigationControls = ({
  onPrev,
  onNext,
  prevButton,
  nextButton,
  classNames,
}: {
  onPrev: () => void;
  onNext: () => void;
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  classNames?: { prev?: string; next?: string };
}) => (
  <div className='flex ml-auto gap-3'>
    {prevButton ? (
      <div onClick={onPrev}>{prevButton}</div>
    ) : (
      <Button variant={'outline'} className={classNames?.prev} onClick={onPrev}>
        <ArrowLeft />
        Prev
      </Button>
    )}
    {nextButton ? (
      <div onClick={onNext}>{nextButton}</div>
    ) : (
      <Button variant={'outline'} className={classNames?.next} onClick={onNext}>
        Next
        <ArrowRight />
      </Button>
    )}
  </div>
);

export function DailyView({
  prevButton,
  nextButton,
  CustomEventComponent,
  CustomEventModal,
  stopDayEventSummary = false,
  classNames,
}: {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  stopDayEventSummary?: boolean;
  classNames?: { prev?: string; next?: string; addEvent?: string };
}) {
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  const [detailedHour, setDetailedHour] = useState<string | null>(null);
  const [timelinePosition, setTimelinePosition] = useState<number>(0);

  const { setOpen } = useModal();
  const { getters, handlers } = useScheduler();

  // Use custom hook for date navigation
  const { currentDate, direction, handleNextDay, handlePrevDay, formattedDayTitle } =
    useTimeNavigation();

  // Generate hours array outside of render
  const hours = useMemo(() => Array.from({ length: 24 }), []);

  // Mouse tracking for timeline position
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
    setDetailedHour(`${hour12}:${Math.max(0, minutes).toString().padStart(2, '0')} ${ampm}`);

    // Ensure timelinePosition is within bounds
    const position = Math.max(0, Math.min(rect.height, Math.round(y)));
    setTimelinePosition(position);
  }, []);

  // Reset timeline when mouse leaves
  const handleMouseLeave = useCallback(() => {
    setDetailedHour(null);
  }, []);

  // Fetch events for the current day using memoization
  const dayEvents = useMemo(
    () => getters.getEventsForDay(currentDate.getDate(), currentDate),
    [getters, currentDate],
  );

  // Use custom hook for event grouping
  const timeGroups = useEventGrouping(dayEvents);

  // Handle adding a new event
  const handleAddEvent = useCallback(
    (event?: Event) => {
      const startDate = event?.startDate || new Date();
      const endDate = event?.endDate || new Date();

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

  // Parse time string and create event
  const handleAddEventDay = useCallback(
    (timeString: string | null) => {
      if (!timeString) {
        console.error('Time not provided');
        return;
      }

      // Parse the 12-hour format time
      const [timePart, ampm] = timeString.split(' ');
      const [hourStr, minuteStr] = timePart.split(':');
      let hours = parseInt(hourStr);
      const minutes = parseInt(minuteStr);

      // Convert to 24-hour format
      if (ampm === 'PM' && hours < 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }

      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        hours,
        minutes,
      );

      handleAddEvent({
        startDate: date,
        endDate: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour duration
        title: '',
        id: '',
        variant: 'primary',
      });
    },
    [currentDate, handleAddEvent],
  );

  // Add active hour indicators (current time)
  const [currentHourPosition, setCurrentHourPosition] = useState<number | null>(null);

  useEffect(() => {
    // Update position of "now" indicator
    const updateCurrentTime = () => {
      if (!hoursColumnRef.current) return;

      const now = new Date();
      const currentDay = new Date();

      // Only show indicator if viewing current day
      if (currentDate.toDateString() !== currentDay.toDateString()) {
        setCurrentHourPosition(null);
        return;
      }

      const hourFraction = now.getHours() + now.getMinutes() / 60;
      const height = hoursColumnRef.current.getBoundingClientRect().height;
      const position = (hourFraction / 24) * height;
      setCurrentHourPosition(position);
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentDate]);

  return (
    <div className='daily-view-container'>
      <div className='flex justify-between gap-3 flex-wrap mb-5'>
        <h1 className='text-3xl font-semibold mb-4'>{formattedDayTitle}</h1>

        <NavigationControls
          onPrev={handlePrevDay}
          onNext={handleNextDay}
          prevButton={prevButton}
          nextButton={nextButton}
          classNames={classNames}
        />
      </div>

      <AnimatePresence initial={false} custom={direction} mode='wait'>
        <motion.div
          key={currentDate.toISOString()}
          custom={direction}
          variants={pageTransitionVariants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className='flex flex-col gap-4'
        >
          {/* Day summary section - events displayed as cards */}
          {!stopDayEventSummary && dayEvents && (
            <div className='all-day-events'>
              <AnimatePresence initial={false}>
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className='mb-2'
                    >
                      <EventStyled
                        event={{
                          ...event,
                          CustomEventComponent,
                          minmized: false,
                        }}
                        CustomEventModal={CustomEventModal}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className='text-muted-foreground py-2'>No events for today</div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Time grid view */}
          <div className='relative rounded-md bg-default-50 hover:bg-default-100 transition duration-400'>
            <motion.div
              className='relative rounded-xl flex ease-in-out'
              ref={hoursColumnRef}
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Time labels column */}
              <div className='flex flex-col'>
                {hours.map((_, index) => (
                  <motion.div
                    key={`hour-${index}`}
                    variants={itemVariants}
                    className='cursor-pointer transition duration-300 p-4 h-[64px] text-left text-sm text-muted-foreground border-default-200'
                  >
                    <HourLabel hour={index} />
                  </motion.div>
                ))}
              </div>

              {/* Time slots grid */}
              <div className='flex relative flex-grow flex-col'>
                {hours.map((_, index) => (
                  <div
                    key={`hour-${index}`}
                    onClick={() => handleAddEventDay(detailedHour)}
                    className='cursor-pointer w-full relative border-b hover:bg-default-200/50 transition duration-300 p-4 h-[64px] text-left text-sm text-muted-foreground border-default-200'
                  >
                    <div className='absolute bg-accent flex items-center justify-center text-xs opacity-0 transition left-0 top-0 duration-250 hover:opacity-100 w-full h-full'>
                      Add Event
                    </div>
                  </div>
                ))}

                {/* Current time indicator */}
                {currentHourPosition !== null && (
                  <div
                    className='absolute left-0 right-0 h-[2px] bg-red-500 z-40'
                    style={{ top: `${currentHourPosition}px` }}
                  >
                    <div className='absolute -left-1 -top-[4px] w-[8px] h-[8px] rounded-full bg-red-500' />
                  </div>
                )}

                {/* Events rendering */}
                <AnimatePresence initial={false}>
                  {dayEvents?.map((event) => {
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
                          top: top,
                          left: left,
                          maxWidth: maxWidth,
                          minWidth: minWidth,
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
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Timeline cursor */}
            <TimelineCursor position={timelinePosition} time={detailedHour} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
