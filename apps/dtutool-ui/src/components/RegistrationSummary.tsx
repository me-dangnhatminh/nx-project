'use client';

import React, { useMemo } from 'react';
import { ConflictResult, SelectedClassroom } from '@/lib/types';
import { SummaryItem } from './SummaryItem';
import { Card, CardContent, CardHeader } from '@ui/components/card';
import { CheckCircle, AlertCircle, BookOpen, CreditCard } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <span className="text-lg font-semibold text-foreground">Registration Summary</span>
      </CardHeader>
      <CardContent>
        <SummaryItem
          icon={BookOpen}
          label="Total Courses"
          value={`${totalCourses} (${activeTotalCourses} selected)`}
        />

        <SummaryItem
          icon={CreditCard}
          label="Total Credits"
          value={`${totalCredits} (${activeCredits} selected)`}
        />

        <SummaryItem
          icon={hasConflicts ? AlertCircle : CheckCircle}
          label="Schedule Conflicts"
          value={hasConflicts ? `${conflictsCount} conflicts` : 'None'}
          valueClassName={hasConflicts ? 'text-destructive font-medium' : 'text-success'}
        />
      </CardContent>
    </Card>
  );
};

export default RegistrationSummary;
