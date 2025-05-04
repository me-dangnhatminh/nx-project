import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import { CalendarOptions, Calendar } from '@fullcalendar/core';

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
export interface CalendarWrapperProps extends CalendarOptions {}

export interface FullCalendarRef {
  getApi: () => Calendar | null;
}

export const CalendarWrapper = forwardRef<FullCalendarRef, CalendarWrapperProps>((props, ref) => {
  const internalRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getApi: () => {
      return internalRef.current?.getApi?.() ?? null;
    },
  }));

  return <FullCalendar {...props} ref={internalRef} />;
});

CalendarWrapper.displayName = 'CalendarWrapper';
