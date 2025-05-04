'use client';

import React from 'react';
import { ConflictResult, SelectedClassroom } from '@shared/types/dtutool';
import { EmptyCourseList } from './empty-course-list';
import { CourseListItem } from './course-list-item';
import { Checkbox } from '@shadcn-ui/components/checkbox';
import { Label } from '@shadcn-ui/components/label';

interface MyCoursesProps {
  selectedClassrooms: SelectedClassroom[];
  activeClassroomIdxs: boolean[];
  scheduleConflicts: ConflictResult[];
  onClassroomActive?: (idxs: number[]) => void;
  onClassroomInactive?: (idxs: number[]) => void;
  onRemoveClassroom?: (classroomId: string) => void;
}

const MyCourses: React.FC<MyCoursesProps> = ({
  selectedClassrooms,
  activeClassroomIdxs,
  scheduleConflicts,
  onClassroomActive,
  onClassroomInactive,
  onRemoveClassroom,
}) => {
  if (selectedClassrooms.length === 0) return <EmptyCourseList />;
  const activeCount = activeClassroomIdxs.filter(Boolean).length;

  return (
    <div className='flex flex-col gap-2'>
      {selectedClassrooms.length > 0 && (
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Checkbox
              id='select-all-courses'
              checked={selectedClassrooms.length === activeCount && selectedClassrooms.length > 0}
              onCheckedChange={(checked) => {
                // Create an array of indices from 0 to (length-1)
                const indices = Array.from({ length: selectedClassrooms.length }, (_, i) => i);

                if (checked) {
                  if (onClassroomActive) onClassroomActive(indices);
                } else {
                  if (onClassroomInactive) onClassroomInactive(indices);
                }
              }}
            />
            <Label htmlFor='select-all-courses' className='text-sm font-medium text-foreground'>
              Show all on calendar
            </Label>
          </div>
          <div className='text-xs text-muted-foreground'>
            {activeCount} of {selectedClassrooms.length} displayed
          </div>
        </div>
      )}

      <div className='space-y-2'>
        {selectedClassrooms.map((selection, idx) => {
          const isConflicted = scheduleConflicts.find((c) => {
            const isCourse1 = c.regId1 === selection.registration.regId;
            const isCourse2 = c.regId2 === selection.registration.regId;
            return isCourse1 || isCourse2;
          });

          const isActive = activeClassroomIdxs[idx] ?? false;

          return (
            <CourseListItem
              key={selection.registration.regId}
              seletedClassroom={selection}
              isActive={isActive}
              isConflicted={!!isConflicted}
              onRemoveClassroom={onRemoveClassroom}
              onActiveChange={(isActive) => {
                if (isActive) {
                  if (onClassroomActive) onClassroomActive([idx]);
                } else {
                  if (onClassroomInactive) onClassroomInactive([idx]);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MyCourses;
