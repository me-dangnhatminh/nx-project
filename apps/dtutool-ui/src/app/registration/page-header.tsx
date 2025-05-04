'use client';

import React from 'react';
import { Button } from '@shadcn-ui/components/button';
import { LogOut, Menu, Calendar, User } from 'lucide-react';
import { ConflictResult } from '@shared/types/dtutool';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';
import { Badge } from '@shadcn-ui/components/badge';
import { cn } from '@shared/utils';

interface PageHeaderProps {
  scheduleConflicts: ConflictResult[];
  selectedCoursesCount: number;
  username: string;
  onLogout?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  scheduleConflicts,
  selectedCoursesCount,
  username,
  onLogout,
}) => {
  const headerRef = React.useRef<HTMLDivElement>(null);
  const hasConflicts = scheduleConflicts?.length > 0;

  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(currentDate);

  // Simplified time format for mobile
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(currentDate);

  return (
    <header
      ref={headerRef}
      className='h-16 bg-card border-b shadow-sm sticky top-0 z-10 flex items-center'
    >
      <div className='max-w-7xl w-full mx-auto px-2'>
        <div className='flex justify-between items-center'>
          {/* Left side - Title and info */}
          <div className='flex flex-col justify-center'>
            <div className='flex items-center justify-between'>
              <h1 className='text-base sm:text-lg lg:text-xl font-bold leading-tight'>
                Course Registration
              </h1>
            </div>

            <div className='flex items-center gap-x-2 mt-0.5'>
              <p className='text-[10px] sm:text-xs text-muted-foreground flex items-center'>
                <Calendar className='h-3 w-3 mr-1 inline' />
                <span className='hidden xs:inline'>{formattedDate}</span>
                <span className='xs:hidden'>{formattedTime}</span>
              </p>

              {selectedCoursesCount > 0 && (
                <>
                  <span className='text-muted-foreground text-[10px]'>•</span>
                  <Badge
                    variant='outline'
                    className={cn(
                      'text-[10px] py-0 h-4',
                      hasConflicts ? 'border-destructive text-destructive' : '',
                    )}
                  >
                    {selectedCoursesCount} {selectedCoursesCount === 1 ? 'course' : 'courses'}{' '}
                    selected
                    {hasConflicts && ` (${scheduleConflicts.length})`}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Right side - combined for all screen sizes */}
          <div className='flex items-center gap-2 sm:gap-4'>
            {/* Username on desktop */}
            <span className='hidden sm:inline text-xs sm:text-sm text-muted-foreground'>
              Welcome, {username}
            </span>

            {/* Logout button on desktop */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => onLogout?.()}
              className='hidden sm:flex h-7 px-2 text-xs items-center'
            >
              <LogOut className='h-3 w-3 mr-1.5' /> Logout
            </Button>

            {/* Mobile menu button */}
            <div className='sm:hidden'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='icon' className='h-7 w-7'>
                    <Menu className='h-3.5 w-3.5' />
                    <span className='sr-only'>Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem className='flex items-center text-xs'>
                    <User className='h-3.5 w-3.5 mr-2' />
                    <span>{username}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onLogout?.()} className='text-xs'>
                    <LogOut className='h-3.5 w-3.5 mr-2' />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
