'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

import { Event, CustomEventModal } from '../types/schedule';
import { useScheduler } from '../providers/schedular-provider';
import { useModal } from '../providers/modal-context';

import { Button } from '@shadcn-ui/components/button';
import { Card } from '@shadcn-ui/components/card';
import { Badge } from '@shadcn-ui/components/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shadcn-ui/components/tooltip';

import { AddEventModal } from './add-event-modal';
import { CustomModal } from './custom-modal';
import { EventStyled } from './event-styled';
import { ShowMoreEventsModal } from './show-more-events-modal';

// Animation variants - moved outside component for better performance
const pageTransitionVariants = {
  enter: () => ({ opacity: 0 }),
  center: { opacity: 1 },
  exit: () => ({
    opacity: 0,
    transition: { opacity: { duration: 0.2, ease: 'easeInOut' } },
  }),
};

const containerVariants = {
  enter: { opacity: 0 },
  center: {
    opacity: 1,
    transition: { staggerChildren: 0.02 },
  },
  exit: { opacity: 0 },
};

const itemVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const monthHeaderVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

// Helper component for month header and navigation
const MonthHeader = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  prevButton,
  nextButton,
  classNames,
}: {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  classNames?: { prev?: string; next?: string };
}) => {
  // Get month name and year for display
  const monthYearText = useMemo(() => {
    return `${currentDate.toLocaleString('default', {
      month: 'long',
    })} ${currentDate.getFullYear()}`;
  }, [currentDate]);

  // Get previous and next month names for tooltips
  const prevMonthText = useMemo(() => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return prevMonth.toLocaleString('default', { month: 'long' });
  }, [currentDate]);

  const nextMonthText = useMemo(() => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toLocaleString('default', { month: 'long' });
  }, [currentDate]);

  return (
    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
      <motion.div
        className='flex items-center'
        key={monthYearText}
        variants={monthHeaderVariants}
        initial='initial'
        animate='animate'
        exit='exit'
      >
        <Calendar className='h-8 w-8 mr-3 text-primary' />
        <h2 className='text-3xl tracking-tight font-bold'>{monthYearText}</h2>
      </motion.div>

      <div className='flex items-center gap-3'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            const today = new Date();
            const newDate = new Date(today.getFullYear(), today.getMonth(), 1);
            // Logic to set current date would be implemented here
          }}
        >
          Today
        </Button>

        <div className='flex gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {prevButton ? (
                  <div onClick={onPrevMonth}>{prevButton}</div>
                ) : (
                  <Button
                    variant='outline'
                    size='icon'
                    className={classNames?.prev}
                    onClick={onPrevMonth}
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>Previous month ({prevMonthText})</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {nextButton ? (
                  <div onClick={onNextMonth}>{nextButton}</div>
                ) : (
                  <Button
                    variant='outline'
                    size='icon'
                    className={classNames?.next}
                    onClick={onNextMonth}
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>Next month ({nextMonthText})</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

// Day cell component
const DayCell = ({
  day,
  isCurrentMonth,
  isToday,
  events,
  onAddEvent,
  onShowMoreEvents,
  CustomEventComponent,
  CustomEventModal,
}: {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
  onAddEvent: (day: number) => void;
  onShowMoreEvents: (events: Event[]) => void;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
}) => {
  // Determine how many events to display directly
  const maxVisibleEvents = 2;
  const hasMoreEvents = events.length > maxVisibleEvents;
  const visibleEvents = events.slice(0, maxVisibleEvents);
  const hiddenEventCount = events.length - maxVisibleEvents;

  return (
    <motion.div className='relative h-[180px] rounded-lg group' variants={itemVariants}>
      <Card
        className={clsx(
          'shadow-sm hover:shadow-md cursor-pointer overflow-hidden relative flex flex-col p-4 border h-full transition-all duration-200',
          isCurrentMonth ? 'bg-card' : 'bg-muted/30',
          isToday && 'ring-2 ring-primary ring-offset-2',
        )}
        onClick={() => isCurrentMonth && onAddEvent(day)}
      >
        {/* Day number */}
        <div className='flex justify-between items-start mb-2'>
          <div
            className={clsx(
              'font-semibold relative text-2xl w-10 h-10 flex items-center justify-center rounded-full',
              isToday ? 'bg-primary text-primary-foreground' : '',
              !isCurrentMonth ? 'text-muted-foreground' : '',
              events.length > 0 && isCurrentMonth ? 'text-primary' : '',
            )}
          >
            {day}
          </div>

          {isCurrentMonth && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity'
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddEvent(day);
                    }}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add event</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Events display */}
        {isCurrentMonth && (
          <div className='flex-grow flex flex-col gap-2 overflow-hidden'>
            <AnimatePresence mode='wait'>
              {visibleEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className='min-h-[28px]'
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
              ))}
            </AnimatePresence>

            {/* More events badge */}
            {hasMoreEvents && (
              <Badge
                onClick={(e) => {
                  e.stopPropagation();
                  onShowMoreEvents(events);
                }}
                variant='secondary'
                className='hover:bg-secondary/80 self-end mt-1 text-xs cursor-pointer transition-colors duration-200'
              >
                +{hiddenEventCount} more
              </Badge>
            )}
          </div>
        )}

        {/* Empty state hover effect */}
        {isCurrentMonth && events.length === 0 && (
          <div className='absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
            <span className='text-primary font-medium flex items-center'>
              <Plus className='mr-1 h-4 w-4' /> Add Event
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export function MonthView({
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
  const { getters, weekStartsOn } = useScheduler();
  const { setOpen } = useModal();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState<number>(0);

  // Memoize days in month to prevent recalculation
  const daysInMonth = useMemo(
    () => getters.getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear()),
    [getters, currentDate],
  );

  // Handle month navigation
  const handlePrevMonth = useCallback(() => {
    setDirection(-1);
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setDirection(1);
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  // Add event handler
  const handleAddEvent = useCallback(
    (selectedDay: number) => {
      // Create start date at 12:00 AM on the selected day
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        selectedDay,
        0,
        0,
        0,
      );

      // Create end date at 11:59 PM on the same day
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        selectedDay,
        23,
        59,
        59,
      );

      setOpen(
        <CustomModal title='Add Event'>
          <AddEventModal CustomAddEventModal={CustomEventModal?.CustomAddEventModal?.CustomForm} />
        </CustomModal>,
        async () => ({
          startDate,
          endDate,
          title: '',
          id: '',
          variant: 'primary',
        }),
      );
    },
    [currentDate, setOpen, CustomEventModal],
  );

  // Show more events handler
  const handleShowMoreEvents = useCallback(
    (dayEvents: Event[]) => {
      if (!dayEvents.length) return;

      const dateString = new Date(dayEvents[0].startDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      setOpen(
        <CustomModal title={`Events on ${dateString}`}>
          <ShowMoreEventsModal />
        </CustomModal>,
        async () => ({
          dayEvents,
        }),
      );
    },
    [setOpen],
  );

  // Calculate days of week labels
  const daysOfWeek = useMemo(() => {
    if (weekStartsOn === 'monday') {
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
        (day) => day.substring(0, 3),
      );
    }
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
      (day) => day.substring(0, 3),
    );
  }, [weekStartsOn]);

  // Calculate calendar grid layout
  const calendarGrid = useMemo(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Calculate start offset (which day of the week the month begins on)
    const startOffset = (firstDayOfMonth.getDay() - (weekStartsOn === 'monday' ? 1 : 0) + 7) % 7;

    // Previous month days for filling the start of the grid
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevMonthDays = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();

    // Calculate next month days for filling the end of the grid
    const totalDaysInCurrentMonth = daysInMonth.length;
    const totalCells = Math.ceil((startOffset + totalDaysInCurrentMonth) / 7) * 7;
    const nextMonthDays = totalCells - (startOffset + totalDaysInCurrentMonth);

    // Build the grid
    const grid: {
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: Event[];
    }[] = [];

    // Add previous month days
    for (let i = 0; i < startOffset; i++) {
      const day = prevMonthDays - startOffset + i + 1;
      grid.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        events: [], // We typically don't show events for previous month
      });
    }

    // Add current month days
    for (let i = 0; i < totalDaysInCurrentMonth; i++) {
      const day = i + 1;
      const isToday =
        today.getDate() === day &&
        today.getMonth() === currentDate.getMonth() &&
        today.getFullYear() === currentDate.getFullYear();

      const dayEvents = getters.getEventsForDay(day, currentDate);

      grid.push({
        day,
        isCurrentMonth: true,
        isToday,
        events: dayEvents || [],
      });
    }

    // Add next month days
    for (let i = 0; i < nextMonthDays; i++) {
      grid.push({
        day: i + 1,
        isCurrentMonth: false,
        isToday: false,
        events: [], // We typically don't show events for next month
      });
    }

    return grid;
  }, [currentDate, daysInMonth, weekStartsOn, getters]);

  return (
    <div className='month-view'>
      <MonthHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        prevButton={prevButton}
        nextButton={nextButton}
        classNames={classNames}
      />

      <AnimatePresence initial={false} custom={direction} mode='wait'>
        <motion.div
          key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
          custom={direction}
          variants={{
            ...pageTransitionVariants,
            center: {
              ...pageTransitionVariants.center,
              transition: {
                opacity: { duration: 0.2 },
                staggerChildren: 0.02,
              },
            },
          }}
          initial='enter'
          animate='center'
          exit='exit'
          className='space-y-6'
        >
          {/* Days of week header */}
          <div className='grid grid-cols-7 gap-1 sm:gap-2 mb-2'>
            {daysOfWeek.map((day, idx) => (
              <div
                key={idx}
                className='text-center py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider'
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className='grid grid-cols-7 gap-1 sm:gap-2'>
            {calendarGrid.map((cellData, idx) => (
              <DayCell
                key={`cell-${idx}`}
                day={cellData.day}
                isCurrentMonth={cellData.isCurrentMonth}
                isToday={cellData.isToday}
                events={cellData.events}
                onAddEvent={handleAddEvent}
                onShowMoreEvents={handleShowMoreEvents}
                CustomEventComponent={CustomEventComponent}
                CustomEventModal={CustomEventModal}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
