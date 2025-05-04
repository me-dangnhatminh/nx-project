'use client';

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@shadcn-ui/components/button';
import { Calendar as CalendarIcon, CalendarDaysIcon } from 'lucide-react';
import { BsCalendarMonth, BsCalendarWeek } from 'react-icons/bs';
import { startOfDay, endOfDay } from 'date-fns';
import { ErrorBoundary } from 'react-error-boundary';
import { ClassNames, CustomComponents } from '../types/schedule';
import { cn } from '@shared/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn-ui/components/tabs';

import { AddEventModal } from './add-event-modal';
import { DailyView } from './views/daily-view';
import { MonthView } from './month-view';
import { WeeklyView } from './week-view';
import { CustomModal } from './custom-modal';
import { useModal } from '../providers/modal-context';

// Define stronger types
type ViewType = 'day' | 'week' | 'month';

interface SchedulerProps {
  views?: {
    views: ViewType[];
    mobileViews: ViewType[];
  };
  stopDayEventSummary?: boolean;
  CustomComponents?: CustomComponents;
  classNames?: ClassNames;
}

// Animation settings for Framer Motion
const animationConfig = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, type: 'spring', stiffness: 250 },
};

// Define reducer for state management
type SchedulerState = {
  activeView: string;
  isMobile: boolean;
  clientSide: boolean;
};

type SchedulerAction =
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'SET_MOBILE'; payload: boolean }
  | { type: 'SET_CLIENT_SIDE'; payload: boolean };

function schedulerReducer(state: SchedulerState, action: SchedulerAction): SchedulerState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_MOBILE':
      return { ...state, isMobile: action.payload };
    case 'SET_CLIENT_SIDE':
      return { ...state, clientSide: action.payload };
    default:
      return state;
  }
}

// Error Fallback Component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className='p-4 bg-red-50 rounded border border-red-200'>
      <h2 className='text-red-800 font-medium'>Something went wrong:</h2>
      <p className='text-red-600'>{error.message}</p>
    </div>
  );
}

export function SchedulerViewFilteration({
  views = {
    views: ['day', 'week', 'month'],
    mobileViews: ['day'],
  },
  stopDayEventSummary = false,
  CustomComponents,
  classNames,
}: SchedulerProps) {
  const { setOpen } = useModal();

  // Use reducer for complex state management
  const [state, dispatch] = useReducer(schedulerReducer, {
    activeView: 'day',
    isMobile: false,
    clientSide: false,
  });

  const { activeView, isMobile, clientSide } = state;

  // Handle client-side initialization
  useEffect(() => {
    dispatch({ type: 'SET_CLIENT_SIDE', payload: true });
  }, []);

  // Handle responsive layout with optimized resize listener
  useEffect(() => {
    if (!clientSide) return;

    const handleResize = () => {
      dispatch({ type: 'SET_MOBILE', payload: window.innerWidth <= 768 });
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clientSide]);

  // Memoize views selector
  const viewsSelector = useMemo(
    () => (isMobile ? views?.mobileViews : views?.views),
    [isMobile, views?.mobileViews, views?.views],
  );

  // Set default view based on available views
  const defaultView = useMemo(() => {
    if (!viewsSelector?.length) return 'day';
    return viewsSelector[0];
  }, [viewsSelector]);

  // Update active view when viewsSelector changes
  useEffect(() => {
    if (viewsSelector?.length && !viewsSelector.includes(activeView as ViewType)) {
      dispatch({ type: 'SET_VIEW', payload: defaultView });
    }
  }, [viewsSelector, activeView, defaultView]);

  // Memoize event handler
  const handleAddEvent = useCallback(
    (selectedDay?: number) => {
      const now = new Date();
      const day = selectedDay ?? now.getDate();

      const startDate = startOfDay(new Date(now.getFullYear(), now.getMonth(), day));
      const endDate = endOfDay(new Date(now.getFullYear(), now.getMonth(), day));

      setOpen(
        <CustomModal
          title={CustomComponents?.CustomEventModal?.CustomAddEventModal?.title || 'Add Event'}
        >
          {CustomComponents?.CustomEventModal?.CustomAddEventModal?.CustomForm ? (
            <CustomComponents.CustomEventModal.CustomAddEventModal.CustomForm endDate={endDate} />
          ) : (
            <AddEventModal
              CustomAddEventModal={
                CustomComponents?.CustomEventModal?.CustomAddEventModal?.CustomForm
              }
              endDate={endDate}
            />
          )}
        </CustomModal>,
      );
    },
    [setOpen, CustomComponents?.CustomEventModal?.CustomAddEventModal],
  );

  // Extracted Tab navigation component
  const ViewTabs = useCallback(
    () => (
      <TabsList>
        <TabsTrigger hidden={!viewsSelector?.includes('day')} value='day' aria-label='Day view'>
          {CustomComponents?.customTabs?.CustomDayTab ? (
            CustomComponents.customTabs.CustomDayTab
          ) : (
            <div className='flex items-center space-x-2'>
              <CalendarDaysIcon size={15} />
              <span>Day</span>
            </div>
          )}
        </TabsTrigger>

        <TabsTrigger hidden={!viewsSelector?.includes('week')} value='week' aria-label='Week view'>
          {CustomComponents?.customTabs?.CustomWeekTab ? (
            CustomComponents.customTabs.CustomWeekTab
          ) : (
            <div className='flex items-center space-x-2'>
              <BsCalendarWeek />
              <span>Week</span>
            </div>
          )}
        </TabsTrigger>

        <TabsTrigger
          hidden={!viewsSelector?.includes('month')}
          value='month'
          aria-label='Month view'
        >
          {CustomComponents?.customTabs?.CustomMonthTab ? (
            CustomComponents.customTabs.CustomMonthTab
          ) : (
            <div className='flex items-center space-x-2'>
              <BsCalendarMonth />
              <span>Month</span>
            </div>
          )}
        </TabsTrigger>
      </TabsList>
    ),
    [viewsSelector, CustomComponents?.customTabs],
  );

  // Extracted Add Event Button component
  const AddEventButton = useCallback(
    () =>
      CustomComponents?.customButtons?.CustomAddEventButton ? (
        <div onClick={() => handleAddEvent()}>
          {CustomComponents.customButtons.CustomAddEventButton}
        </div>
      ) : (
        <Button
          onClick={() => handleAddEvent()}
          className={classNames?.buttons?.addEvent}
          variant='default'
          aria-label='Add new event'
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          Add Event
        </Button>
      ),
    [handleAddEvent, CustomComponents?.customButtons, classNames?.buttons?.addEvent],
  );

  return (
    <div className='flex w-full flex-col'>
      <div className='flex w-full'>
        <Tabs
          value={activeView}
          onValueChange={(value) => dispatch({ type: 'SET_VIEW', payload: value })}
          className={cn('w-full', classNames?.tabs)}
        >
          <div className='flex justify-between items-center mb-4'>
            <ViewTabs />
            <AddEventButton />
          </div>

          {viewsSelector?.includes('day') && (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <TabsContent value='day'>
                <AnimatePresence mode='wait'>
                  <motion.div {...animationConfig}>
                    <DailyView
                      stopDayEventSummary={stopDayEventSummary}
                      classNames={classNames?.buttons}
                      prevButton={CustomComponents?.customButtons?.CustomPrevButton}
                      nextButton={CustomComponents?.customButtons?.CustomNextButton}
                      CustomEventComponent={CustomComponents?.CustomEventComponent}
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </ErrorBoundary>
          )}

          {viewsSelector?.includes('week') && (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <TabsContent value='week'>
                <AnimatePresence mode='wait'>
                  <motion.div {...animationConfig}>
                    <WeeklyView
                      classNames={classNames?.buttons}
                      prevButton={CustomComponents?.customButtons?.CustomPrevButton}
                      nextButton={CustomComponents?.customButtons?.CustomNextButton}
                      CustomEventComponent={CustomComponents?.CustomEventComponent}
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </ErrorBoundary>
          )}

          {viewsSelector?.includes('month') && (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <TabsContent value='month'>
                <AnimatePresence mode='wait'>
                  <motion.div {...animationConfig}>
                    <MonthView
                      classNames={classNames?.buttons}
                      prevButton={CustomComponents?.customButtons?.CustomPrevButton}
                      nextButton={CustomComponents?.customButtons?.CustomNextButton}
                      CustomEventComponent={CustomComponents?.CustomEventComponent}
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </ErrorBoundary>
          )}
        </Tabs>
      </div>
    </div>
  );
}
