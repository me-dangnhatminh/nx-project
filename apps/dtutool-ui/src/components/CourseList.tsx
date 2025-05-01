'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Classroom,
  CourseDetail,
  CourseInfo,
  SelectedClassroom,
} from '@/lib/types';
import { Button } from '@ui/components/button';
import { CourseItem } from './CourseItem';
import { Badge } from '@ui/components/badge';
import { Input } from '@ui/components/input';
import { Search, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { ScrollArea } from '@ui/components/scroll-area';

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
      { threshold: 0.1, rootMargin: '100px' }
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
      return element.parentElement
        ? findScrollableParent(element.parentElement)
        : null;
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
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-muted-foreground">
            {filteredCourses.length}{' '}
            {filteredCourses.length === 1 ? 'course' : 'courses'} found
          </h3>
          {search && search !== localSearch && (
            <Badge variant="secondary" className="ml-2 px-2 py-1">
              Search: {search}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Input
              className="w-[200px] pl-8"
              placeholder="Filter results..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            {localSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7"
                onClick={() => setLocalSearch('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button size="sm" variant="outline" onClick={handleClearSearch}>
            Clear
          </Button>
        </div>
      </div>

      <div
        hidden={filteredCourses.length !== 0}
        className="bg-card p-8 rounded-md text-center"
      >
        <h3 className="font-medium text-lg">No courses found</h3>
        <p className="text-muted-foreground mt-1">
          Try adjusting your search criteria
        </p>
      </div>
      <ScrollArea
        hidden={filteredCourses.length === 0}
        ref={scrollRef}
        className="h-[600px]"
        type="always"
      >
        <div className="pr-3 flex flex-col space-y-2">
          {visibleCourses.map((course) => {
            const isExpanded = expandedItems.has(
              course.courseInfo.courseId.toString()
            );
            return (
              <div
                key={course.courseInfo.courseId}
                className="border rounded-md bg-card"
              >
                <div
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-accent/50 rounded-t-md"
                  onClick={() =>
                    toggleCourse(course.courseInfo.courseId.toString())
                  }
                >
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">
                        {course.courseInfo.courseCode}
                      </span>

                      <Badge
                        hidden={!course.courseInfo.courseType}
                        variant="outline"
                        className="ml-2 text-xs"
                      >
                        {course.courseInfo.courseType}
                      </Badge>

                      <Badge
                        hidden={!course.courseInfo.credits}
                        variant="outline"
                        className="ml-2 text-xs"
                      >
                        {course.courseInfo.credits}{' '}
                        {course.courseInfo.credits === 1 ? 'credit' : 'credits'}
                      </Badge>

                      <Badge
                        hidden={!course.courseInfo.coRequisite}
                        variant="outline"
                        className="ml-2 text-xs"
                      >
                        Co-Req
                      </Badge>

                      <Badge
                        hidden={!course.courseInfo.preRequisite}
                        variant="outline"
                        className="ml-2 text-xs"
                      >
                        Pre-Req
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {course.courseInfo.courseName}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3 pt-0">
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

          {visibleRange.end < filteredCourses.length && (
            <div ref={loaderRef} className="py-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading more courses...
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
