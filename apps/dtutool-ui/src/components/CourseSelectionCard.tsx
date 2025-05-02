'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/components/card';
import { Button } from '@ui/components/button';
import { ConflictResult, SelectedClassroom } from '@/lib/types';
import MyCourses from './MyCourses';

interface CourseSelectionCardProps {
  tab: 'search' | 'calendar';
  scheduleConflicts: ConflictResult[];
  setTab: (tab: 'search' | 'calendar') => void;
  selectedClassrooms: SelectedClassroom[];
  activeClassroomIdxs: boolean[];
  onRemoveClassroom?: (classroomId: string) => void;
  onClassroomActive?: (idxs: number[]) => void;
  onClassroomInactive?: (idxs: number[]) => void;
}

export const CourseSelectionCard: React.FC<CourseSelectionCardProps> = ({
  tab,
  setTab,
  selectedClassrooms,
  activeClassroomIdxs,
  onRemoveClassroom,
  onClassroomActive,
  onClassroomInactive,
  scheduleConflicts,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Seleted Classrooms</CardTitle>
          <Button
            hidden={tab !== 'search'}
            variant="default"
            size="sm"
            onClick={() => setTab('calendar')}
            className="text-xs h-7"
          >
            View in Calendar
          </Button>
          <Button
            hidden={tab !== 'calendar'}
            variant="outline"
            size="sm"
            onClick={() => setTab('search')}
            className="text-xs h-7"
          >
            Back to Search
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <MyCourses
          selectedClassrooms={selectedClassrooms}
          activeClassroomIdxs={activeClassroomIdxs}
          scheduleConflicts={scheduleConflicts}
          onRemoveClassroom={onRemoveClassroom}
          onClassroomActive={onClassroomActive}
          onClassroomInactive={onClassroomInactive}
        />
      </CardContent>
    </Card>
  );
};

export default CourseSelectionCard;
