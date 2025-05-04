'use client';

import { SchedulerViewFilteration } from './schedular-view-filteration';

export function SchedulerView() {
  return (
    <div className='flex flex-col gap-6'>
      <SchedulerViewFilteration />
    </div>
  );
}
