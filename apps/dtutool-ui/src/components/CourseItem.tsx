'use client';

import React, { useEffect, useState } from 'react';
import {
  Classroom,
  CourseDetail,
  CourseInfo,
  SelectedClassroom,
} from '@/lib/types';
import { Separator } from '@ui/components/separator';
import { ClassroomItem } from './ClassroomItem';
import { Button } from '@ui/components/button';
import { Loader2, ChevronDown } from 'lucide-react';

type CourseItemProps = {
  academic: string;
  semester: string;
  course: CourseDetail;
  selectedClassrooms: SelectedClassroom[];
  activeClassroomIdxs: boolean[];
  onAddClassroom?: (course: CourseInfo, classroom: Classroom) => void;
  handleFetchCourse: (course: CourseDetail) => Promise<void>;
};

export const CourseItem = ({
  academic,
  semester,
  course,
  selectedClassrooms,
  onAddClassroom,
  handleFetchCourse,
}: CourseItemProps) => {
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const initialDisplayCount = 2;

  useEffect(() => {
    if (course.classrooms) return;
    if (loading) return;
    setLoading(true);
    handleFetchCourse(course).finally(() => setLoading(false));
  }, [course, academic, semester, handleFetchCourse, loading]);

  // Calculate description height based on content length
  const getDescriptionHeight = () => {
    const desc = course.courseInfo.description;
    if (!desc) return 0;
    return Math.min(Math.ceil(desc.length / 50) * 20 + 10, 80); // Approximate height
  };

  // Render loading state with min-height to prevent layout shifts
  if (!course.classrooms)
    return (
      <div
        className="flex items-center justify-center py-4"
        style={{ minHeight: '150px' }}
      >
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <p>Loading sections...</p>
      </div>
    );

  // Handle empty state with consistent height
  if (course.classrooms.length === 0) {
    return (
      <div
        className="bg-muted/30 p-4 rounded-md text-center"
        style={{ minHeight: '100px' }}
      >
        <p>No sections available for this course</p>
      </div>
    );
  }

  // Display subset of classrooms or all based on showAll state
  const displayClassrooms = showAll
    ? course.classrooms
    : course.classrooms.slice(0, initialDisplayCount);

  return (
    <div className="mt-3">
      {course.courseInfo.description && (
        <p
          className="text-sm text-muted-foreground mb-3"
          style={{ minHeight: getDescriptionHeight() }}
        >
          {course.courseInfo.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        {course.courseInfo.preRequisite && (
          <div>
            <span className="text-muted-foreground font-medium">
              Prerequisites:
            </span>{' '}
            {course.courseInfo.preRequisite}
          </div>
        )}
        {course.courseInfo.coRequisite && (
          <div>
            <span className="text-muted-foreground font-medium">
              Corequisites:
            </span>{' '}
            {course.courseInfo.coRequisite}
          </div>
        )}
      </div>

      <Separator className="my-3" />

      <h4 className="font-medium text-sm mb-2">Available Sections:</h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {displayClassrooms.map((classroom, idx) => {
          const registration = classroom.registration;
          const regId = registration.regId;
          const isSelected = selectedClassrooms.some((selectedClassroom) => {
            const selectedRegId = selectedClassroom.registration.regId;
            return selectedRegId === regId;
          });
          return (
            <ClassroomItem
              key={idx}
              course={course.courseInfo}
              classroom={classroom}
              isSelected={isSelected}
              onAddClassroom={onAddClassroom}
            />
          );
        })}
      </div>

      {course.classrooms.length > initialDisplayCount && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full flex items-center justify-center"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll
            ? 'Show Less'
            : `Show All Sections (${
                course.classrooms.length - initialDisplayCount
              } more)`}
          <ChevronDown
            className={`ml-1 h-4 w-4 transition-transform ${
              showAll ? 'rotate-180' : ''
            }`}
          />
        </Button>
      )}
    </div>
  );
};
