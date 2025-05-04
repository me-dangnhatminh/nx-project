'use client';

import { SchedulerView } from './schedular-view';

export function SchedulerWrapper() {
  return (
    <div className='w-full'>
      <h1 className='tracking-tighter font-semibold text-8xl mb-10'>Event Schedule</h1>
      <SchedulerView />
    </div>
  );
}
