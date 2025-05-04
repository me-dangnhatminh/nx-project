'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Classroom, CourseDetail, CourseInfo, SelectedClassroom } from '@shared/types/dtutool';
import { Button } from '@shadcn-ui/components/button';
import { CourseItem } from './CourseItem';
import { Badge } from '@shadcn-ui/components/badge';
import { Input } from '@shadcn-ui/components/input';
import { Search, X, ChevronDown, ChevronUp, Loader2, Filter } from 'lucide-react';
import { ScrollArea } from '@shadcn-ui/components/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';

interface CourseListProps {
  academic: string;
  semester: string;
  search?: string;
  courses: CourseDetail[];
  selectedClassrooms: SelectedClassroom[];
  onAddClassroom?: (course: CourseInfo, classroom: Classroom) => void;
  handleClearSearch?: () => void;
  handleFetchCourse: (course: CourseDetail) => Promise<void>;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  academic,
  semester,
  search,
  selectedClassrooms,
  onAddClassroom,
  handleClearSearch,
  handleFetchCourse,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [localSearch, setLocalSearch] = useState(search || '');
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const filteredCourses = localSearch
    ? courses.filter((course) => {
        const searchLower = localSearch.toLowerCase();
        return (
          course.courseInfo.courseCode.toLowerCase().includes(searchLower) ||
          course.courseInfo.courseName.toLowerCase().includes(searchLower) ||
          (course.courseInfo.description &&
            course.courseInfo.description.toLowerCase().includes(searchLower))
        );
      })
    : courses;

  // Get visible courses based on current range
  const visibleCourses = filteredCourses.slice(0, visibleRange.end);

  // Toggle course expansion
  const toggleCourse = (courseId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    setVisibleRange({ start: 0, end: Math.min(20, filteredCourses.length) });
  }, [filteredCourses.length]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && visibleRange.end < filteredCourses.length) {
          // Load more courses when loader is visible
          setVisibleRange((prev) => ({
            start: prev.start,
            end: Math.min(prev.end + 10, filteredCourses.length),
          }));
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [visibleRange.end, filteredCourses.length]);

  useEffect(() => {
    if (!scrollRef.current) return;

    const findScrollableParent = (element: HTMLElement): HTMLElement | null => {
      if (!element) return null;

      const style = window.getComputedStyle(element);
      const hasScroll = ['auto', 'scroll'].includes(style.overflowY);

      if (hasScroll) return element;

      // Continue up the tree
      return element.parentElement ? findScrollableParent(element.parentElement) : null;
    };

    const scrollElement = findScrollableParent(scrollRef.current);

    if (!scrollElement) return;

    const handleManualScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const scrollBottom = scrollTop + clientHeight;
      const scrollPercentage = scrollBottom / scrollHeight;

      if (scrollPercentage > 0.8 && visibleRange.end < filteredCourses.length) {
        setVisibleRange((prev) => ({
          start: prev.start,
          end: Math.min(prev.end + 10, filteredCourses.length),
        }));
      }
    };

    scrollElement.addEventListener('scroll', handleManualScroll);

    return () => {
      scrollElement.removeEventListener('scroll', handleManualScroll);
    };
  }, [visibleRange.end, filteredCourses.length]);

  return (
    <div className='space-y-2'>
      {/* Header section - responsive layout for mobile and desktop */}
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0'>
        <div className='flex items-center'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
          </h3>
          {search && search !== localSearch && (
            <Badge variant='secondary' className='ml-2 px-2 py-0.5 text-xs'>
              Search: {search}
            </Badge>
          )}
        </div>

        {/* Responsive search controls */}
        <div className='flex w-full sm:w-auto gap-2'>
          {/* Mobile filter button */}
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild className='sm:hidden'>
              <Button variant='outline' size='icon' className='h-9 w-9'>
                <Filter className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[200px]'>
              <div className='p-2'>
                <Input
                  className='mb-2'
                  placeholder='Filter results...'
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
                <Button
                  size='sm'
                  variant='outline'
                  className='w-full'
                  onClick={() => {
                    handleClearSearch?.();
                    setIsFilterOpen(false);
                  }}
                >
                  Clear
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop search input */}
          <div className='relative flex-1 sm:flex-initial hidden sm:block'>
            <Input
              className='w-full sm:w-[200px] pl-8'
              placeholder='Filter results...'
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            {localSearch && (
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-1 top-1 h-7 w-7'
                onClick={() => setLocalSearch('')}
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>

          {/* Mobile search input */}
          <div className='relative flex-1 sm:hidden'>
            <Input
              className='w-full pl-8'
              placeholder='Filter results...'
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            {localSearch && (
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-1 top-1 h-7 w-7'
                onClick={() => setLocalSearch('')}
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={handleClearSearch}
            className='hidden sm:inline-flex'
          >
            Clear
          </Button>
        </div>
      </div>

      {/* No courses message */}
      <div
        hidden={filteredCourses.length !== 0}
        className='bg-card p-4 sm:p-8 rounded-md text-center'
      >
        <h3 className='font-medium text-base sm:text-lg'>No courses found</h3>
        <p className='text-sm sm:text-base text-muted-foreground mt-1'>
          Try adjusting your search criteria
        </p>
      </div>

      {/* Course list with responsive height */}
      <ScrollArea
        hidden={filteredCourses.length === 0}
        ref={scrollRef}
        className='h-[400px] sm:h-[500px] md:h-[600px]'
        type='always'
      >
        <div className='pr-3 flex flex-col space-y-2'>
          {visibleCourses.map((course) => {
            const isExpanded = expandedItems.has(course.courseInfo.courseId.toString());
            return (
              <div key={course.courseInfo.courseId} className='border rounded-md bg-card'>
                {/* Course header - responsive layout */}
                <div
                  className='flex justify-between items-center p-2 sm:p-3 cursor-pointer hover:bg-accent/50 rounded-t-md'
                  onClick={() => toggleCourse(course.courseInfo.courseId.toString())}
                >
                  <div className='w-full'>
                    <div className='flex flex-wrap items-center gap-1 sm:gap-2'>
                      <span className='font-medium text-sm sm:text-base'>
                        {course.courseInfo.courseCode}
                      </span>

                      {/* Responsive badges with conditional rendering for mobile */}
                      <div className='flex flex-wrap gap-1'>
                        {course.courseInfo.courseType && (
                          <Badge variant='outline' className='text-[10px] sm:text-xs'>
                            {course.courseInfo.courseType}
                          </Badge>
                        )}

                        {course.courseInfo.credits && (
                          <Badge variant='outline' className='text-[10px] sm:text-xs'>
                            {course.courseInfo.credits}{' '}
                            {course.courseInfo.credits === 1 ? 'credit' : 'credits'}
                          </Badge>
                        )}

                        {/* Hide these badges on mobile for space */}
                        {course.courseInfo.coRequisite && (
                          <Badge
                            variant='outline'
                            className='hidden sm:inline-flex text-[10px] sm:text-xs'
                          >
                            Co-Req
                          </Badge>
                        )}

                        {course.courseInfo.preRequisite && (
                          <Badge
                            variant='outline'
                            className='hidden sm:inline-flex text-[10px] sm:text-xs'
                          >
                            Pre-Req
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className='text-xs sm:text-sm text-muted-foreground mt-0.5 truncate pr-6'>
                      {course.courseInfo.courseName}
                    </div>
                  </div>
                  <div className='flex items-center ml-2'>
                    {isExpanded ? (
                      <ChevronUp className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground' />
                    ) : (
                      <ChevronDown className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground' />
                    )}
                  </div>
                </div>

                {/* Course details when expanded */}
                {isExpanded && (
                  <div className='p-2 sm:p-3 pt-0'>
                    <CourseItem
                      academic={academic}
                      semester={semester}
                      course={course}
                      handleFetchCourse={handleFetchCourse}
                      selectedClassrooms={selectedClassrooms}
                      onAddClassroom={onAddClassroom}
                      activeClassroomIdxs={[]}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {visibleRange.end < filteredCourses.length && (
            <div ref={loaderRef} className='py-3 sm:py-4 text-center'>
              <Loader2 className='h-5 w-5 sm:h-6 sm:w-6 animate-spin mx-auto mb-2' />
              <p className='text-xs sm:text-sm text-muted-foreground'>Loading more courses...</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
