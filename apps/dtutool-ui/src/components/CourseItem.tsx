'use client';

import React, { useEffect, useState } from 'react';
import { Classroom, CourseDetail, CourseInfo, SelectedClassroom } from '@shared/types/dtutool';
import { Separator } from '@shadcn-ui/components/separator';
import { ClassroomItem } from './ClassroomItem';
import { Button } from '@shadcn-ui/components/button';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@shared/utils';

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
  const [expanded, setExpanded] = useState(false);
  const initialDisplayCount = 2;

  useEffect(() => {
    if (course.classrooms) return;
    if (loading) return;
    setLoading(true);
    handleFetchCourse(course).finally(() => setLoading(false));
  }, [course, academic, semester, handleFetchCourse, loading]);

  // Handle description expansion for longer text
  const toggleDescription = () => {
    setExpanded(!expanded);
  };

  // Check if description should be truncated
  const shouldTruncate = () => {
    const desc = course.courseInfo.description;
    return desc && desc.length > 150;
  };

  // Render loading state with min-height to prevent layout shifts
  if (!course.classrooms)
    return (
      <div
        className='flex items-center justify-center py-3 sm:py-4'
        style={{ minHeight: '100px', maxHeight: '150px' }}
      >
        <Loader2 className='h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2' />
        <p className='text-sm'>Loading sections...</p>
      </div>
    );

  // Handle empty state with consistent height
  if (course.classrooms.length === 0) {
    return (
      <div className='bg-muted/30 p-3 sm:p-4 rounded-md text-center' style={{ minHeight: '80px' }}>
        <p className='text-sm'>No sections available for this course</p>
      </div>
    );
  }

  // Display subset of classrooms or all based on showAll state
  const displayClassrooms = showAll
    ? course.classrooms
    : course.classrooms.slice(0, initialDisplayCount);

  return (
    <div className='mt-2 sm:mt-3'>
      {/* Course description with responsive text handling */}
      {course.courseInfo.description && (
        <div className='mb-2 sm:mb-3'>
          <p
            className={cn(
              'text-xs sm:text-sm text-muted-foreground',
              !expanded && shouldTruncate() ? 'line-clamp-3' : '',
            )}
          >
            {course.courseInfo.description}
          </p>

          {shouldTruncate() && (
            <Button
              variant='ghost'
              size='sm'
              onClick={toggleDescription}
              className='mt-1 h-6 text-xs px-2 py-0'
            >
              {expanded ? (
                <>
                  Show Less <ChevronUp className='ml-1 h-3 w-3' />
                </>
              ) : (
                <>
                  Read More <ChevronDown className='ml-1 h-3 w-3' />
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Course requirements with responsive grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 mb-2 sm:mb-3 text-xs sm:text-sm'>
        {course.courseInfo.preRequisite && (
          <div>
            <span className='text-muted-foreground font-medium'>Prerequisites:</span>{' '}
            <span className='break-words'>{course.courseInfo.preRequisite}</span>
          </div>
        )}
        {course.courseInfo.coRequisite && (
          <div>
            <span className='text-muted-foreground font-medium'>Corequisites:</span>{' '}
            <span className='break-words'>{course.courseInfo.coRequisite}</span>
          </div>
        )}
      </div>

      <Separator className='my-2 sm:my-3' />

      {/* Sections header */}
      <h4 className='font-medium text-xs sm:text-sm mb-2'>Available Sections:</h4>

      {/* Responsive grid layout for sections */}
      <div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3'>
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

      {/* Show more/less button with responsive styling */}
      {course.classrooms.length > initialDisplayCount && (
        <Button
          variant='ghost'
          size='sm'
          className='mt-2 sm:mt-3 w-full flex items-center justify-center text-xs sm:text-sm py-1'
          onClick={() => setShowAll(!showAll)}
        >
          {showAll
            ? 'Show Less'
            : `Show All Sections (${course.classrooms.length - initialDisplayCount} more)`}
          <ChevronDown
            className={`ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform ${
              showAll ? 'rotate-180' : ''
            }`}
          />
        </Button>
      )}
    </div>
  );
};
