'use client';

import React, { useMemo } from 'react';
import { ConflictResult, SelectedClassroom } from '@shared/types/dtutool';
import { SummaryItem } from './summary-item';
import { Card, CardContent, CardHeader } from '@shadcn-ui/components/card';
import { CheckCircle, AlertCircle, BookOpen, CreditCard } from 'lucide-react';
import { cn } from '@shared/utils';
import { Badge } from '@shadcn-ui/components/badge';

interface RegistrationSummaryProps {
  selectedClassrooms: SelectedClassroom[];
  activeClassroomIdxs: boolean[];
  scheduleConflicts: ConflictResult[];
}

export const RegistrationSummary: React.FC<RegistrationSummaryProps> = ({
  selectedClassrooms,
  activeClassroomIdxs,
  scheduleConflicts,
}) => {
  const totalCourses = useMemo(() => {
    return selectedClassrooms.length;
  }, [selectedClassrooms]);

  const totalCredits = useMemo(() => {
    let sum = 0;
    selectedClassrooms.forEach((s) => {
      sum += s.course.credits || 0;
    });
    return sum;
  }, [selectedClassrooms]);

  const activeCredits = useMemo(() => {
    let sum = 0;
    selectedClassrooms.forEach((s, idx) => {
      const isActive = activeClassroomIdxs[idx];
      if (isActive) sum += s.course.credits || 0;
    });
    return sum;
  }, [selectedClassrooms, activeClassroomIdxs]);

  const activeTotalCourses = useMemo(() => {
    return activeClassroomIdxs.filter(Boolean).length;
  }, [activeClassroomIdxs]);

  const conflictsCount = scheduleConflicts.length;
  const hasConflicts = conflictsCount > 0;

  return (
    <Card className={cn('p-2 sm:p-4', 'rounded-lg border gap-2')}>
      <CardHeader className='p-0'>
        <span className='text-base sm:text-lg font-semibold text-foreground'>
          Registration Summary
        </span>
      </CardHeader>
      <CardContent className='p-0'>
        <SummaryItem
          icon={BookOpen}
          label={
            <>
              <span className='hidden sm:inline'>Total Courses</span>
              <span className='inline sm:hidden'>Courses</span>
            </>
          }
          value={`${totalCourses} (${activeTotalCourses} selected)`}
        />

        <SummaryItem
          icon={CreditCard}
          label={
            <>
              <span className='hidden sm:inline'>Total Credits</span>
              <span className='inline sm:hidden'>Credits</span>
            </>
          }
          value={`${totalCredits} (${activeCredits} selected)`}
        />

        <SummaryItem
          icon={hasConflicts ? AlertCircle : CheckCircle}
          label={
            <>
              <span className='hidden sm:inline'>Schedule Conflicts</span>
              <span className='inline sm:hidden'>Conflicts</span>
            </>
          }
          value={hasConflicts ? `${conflictsCount} conflicts` : 'None'}
          valueClassName={hasConflicts ? 'text-destructive font-medium' : 'text-success'}
        />
      </CardContent>
    </Card>
  );
};

export default RegistrationSummary;
