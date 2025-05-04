'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Package, Loader2 } from 'lucide-react';
import { Classroom, CourseDetail, CourseInfo, SelectedClassroom } from '@shared/types/dtutool';
import { dtutoolApi } from '@dtutool/apis';
import { cn } from '@shared/utils';
import { CourseList, EmptyStateView, AcademicSelector } from '../../components/registration';

// gen 4 item from now
const now = new Date();
const currentYear = now.getFullYear();
const academics = Array.from({ length: 4 }, (_, i) => ({
  id: `${currentYear - 1 - i}-${currentYear - i}`,
  label: `${currentYear - 1 - i}-${currentYear - i}`,
}));

const semesters = [
  { id: '1', label: 'First Semester' },
  { id: '2', label: 'Second Semester' },
  { id: '3', label: 'Summer Semester' },
];

interface TabSearchProps {
  academic?: string;
  semester?: string;
  selectedClassrooms: SelectedClassroom[];
  onAddClassroom?: (course: CourseInfo, classroom: Classroom) => void;
  onSelectedAcademic: (academic: string) => void;
  onSelectedSemester: (semester: string) => void;
}

const TabSearch: React.FC<TabSearchProps> = ({
  academic,
  semester,
  selectedClassrooms,
  onAddClassroom,
  onSelectedAcademic,
  onSelectedSemester,
}) => {
  const [courses, setCourses] = useState<CourseDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetching, setFetching] = useState(false);

  useEffect(
    () => {
      if (!academic || !semester) return;
      if (fetching) return;
      setFetching(true);
      dtutoolApi
        .getCourses({ academic, semester })
        .then((data) => data.map((courseInfo) => ({ courseInfo })))
        .then((data) => setCourses(data))
        .finally(() => setFetching(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [academic, semester],
  );

  const onFetchCourse = useCallback(
    (course: CourseDetail) => {
      setCourses((prev) => {
        if (!prev) return prev;
        const idx = prev.findIndex((c) => c.courseInfo.courseId === course.courseInfo.courseId);
        if (idx === -1) return prev;
        const updatedCourses = [...prev];
        updatedCourses[idx] = course;
        return updatedCourses;
      });
    },
    [setCourses],
  );

  return (
    <div className={cn('w-full h-full max-h-full overflow-hidden', 'flex flex-col gap-4')}>
      <AcademicSelector
        academics={academics}
        semesters={semesters}
        academic={academic}
        semester={semester}
        onSelectedAcademic={onSelectedAcademic}
        onSelectedSemester={onSelectedSemester}
      />

      <div
        className={cn(
          'flex 1',
          'w-full h-full max-h-full overflow-hidden',
          'flex justify-center items-start',
        )}
      >
        {fetching && (
          <div className='flex flex-col items-center justify-center py-12'>
            <Loader2 className='h-4 w-4 animate-spin mb-4' />
            <p className='text-lg font-medium'>Loading courses...</p>
            <p className='text-muted-foreground'>This might take a moment</p>
          </div>
        )}

        <EmptyStateView
          hidden={!(!academic || !semester)}
          icon={Calendar}
          title='Select Academic Year and Semester'
          description='You must select both academic year and semester to view available courses'
        />

        <EmptyStateView
          hidden={!(!fetching && courses.length === 0)}
          icon={Package}
          title='No courses found'
          description='No courses found for the selected academic year and semester'
        />

        {!fetching && academic && semester && courses.length > 0 && (
          <CourseList
            courses={courses}
            academic={academic}
            semester={semester}
            search={searchTerm}
            handleFetchCourse={(course: CourseDetail) => {
              const courseId = course.courseInfo.courseId;
              return dtutoolApi
                .getClassrooms({ courseId, academic, semester })
                .then((data) => onFetchCourse(data));
            }}
            selectedClassrooms={selectedClassrooms}
            onAddClassroom={onAddClassroom}
            handleClearSearch={() => {
              setSearchTerm('');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TabSearch;
