'use client';

import React from 'react';
import { Button } from '@shadcn-ui/components/button';
import { LogOut } from 'lucide-react';
import { ConflictResult } from '@shared/types/dtutool';

interface PageHeaderProps {
  scheduleConflicts: ConflictResult[];
  selectedCoursesCount: number;
  username: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ selectedCoursesCount, username }) => {
  const headerRef = React.useRef<HTMLDivElement>(null);

  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(currentDate);

  return (
    <header ref={headerRef} className='bg-card border-b shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold'>Course Registration System</h1>
            <p className='text-sm text-muted-foreground'>
              {formattedDate} •{' '}
              {selectedCoursesCount > 0
                ? `${selectedCoursesCount} courses selected`
                : 'No courses selected'}
            </p>
          </div>
          <div className='flex items-center space-x-4'>
            <span className='text-sm text-muted-foreground'>Welcome, {username}</span>
            <Button variant='outline' size='sm'>
              <LogOut className='h-4 w-4 mr-2' /> Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
