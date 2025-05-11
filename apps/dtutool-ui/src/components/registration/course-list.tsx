'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Classroom, CourseDetail, CourseInfo, SelectedClassroom } from '@shared/types/dtutool';
import { Button } from '@shadcn-ui/components/button';
import { CourseItem } from './course-item';
import { Badge } from '@shadcn-ui/components/badge';
import { Input } from '@shadcn-ui/components/input';
import { Search, X, ChevronDown, ChevronUp, Loader2, Filter } from 'lucide-react';
import { ScrollArea } from '@shadcn-ui/components/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';
import { cn } from '@shared/utils';
import debounce from 'lodash/debounce';
import { isValidRegId } from '@dtutool/services/registration/get-detail-from-regids';
import { dtutoolApi } from '@dtutool/apis';

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
  const [localSearch, setLocalSearch] = useState(() => search || '');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const debouncedFilterRef = useRef<ReturnType<typeof debounce>>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [filterState, setFilterState] = useState<{
    items: CourseDetail[];
    isSearching: boolean;
  }>({ items: courses, isSearching: false });

  // Effect to sync search prop with local state - only on mount or when search prop changes
  useEffect(() => {
    if (search !== undefined) {
      setLocalSearch(search);
    }
  }, [search]); // Removed localSearch dependency to prevent loops

  // Effect to sync courses prop with filter state when no search is active
  useEffect(() => {
    const trimmedSearch = localSearch.trim();
    if (!trimmedSearch) setFilterState((prev) => ({ ...prev, items: courses }));
  }, [courses, localSearch]);

  // Setup debounced filter function
  useEffect(() => {
    const handleFilterChange = (searchTerm: string) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) {
        setFilterState((prev) => ({ ...prev, items: courses, isSearching: false }));
        return;
      }

      const cleanSearch = trimmed.toLowerCase();
      const isRegCode = isValidRegId(trimmed.toUpperCase());

      if (isRegCode) {
        setFilterState((prev) => ({ ...prev, isSearching: true }));
        dtutoolApi
          .getClassroomsByRegIds({ academic, semester, regIds: [cleanSearch] })
          .then((data) => {
            const validCourses = data.filter((v) => v !== null);
            setFilterState((prev) => ({ ...prev, items: validCourses, isSearching: false }));
          })
          .catch((error) => {
            console.error('Error fetching courses:', error);
            setFilterState((prev) => ({ ...prev, items: [], isSearching: false }));
          });
        return;
      }

      // Regular search by course attributes
      const filteredCourses = courses.filter(
        ({ courseInfo: { courseCode, courseName, description } }) => {
          return (
            courseCode.toLowerCase().includes(cleanSearch) ||
            courseName.toLowerCase().includes(cleanSearch) ||
            (description && description.toLowerCase().includes(cleanSearch))
          );
        },
      );
      setFilterState((prev) => ({ ...prev, items: filteredCourses, isSearching: false }));
    };

    debouncedFilterRef.current = debounce(handleFilterChange, 300);

    return () => {
      debouncedFilterRef.current?.cancel();
    };
  }, [academic, courses, semester]);

  // Fixed: Separate handler for search input changes to prevent blocking typing
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalSearch(newValue); // Update immediately for responsive UI
  }, []);

  // Trigger search when localSearch changes - with appropriate debounce
  useEffect(() => {
    if (debouncedFilterRef.current) {
      debouncedFilterRef.current(localSearch);
    }
  }, [localSearch]);

  // Calculate visible courses and whether there are more to load
  const { visibleCourses, hasMoreCoursesToLoad } = useMemo(() => {
    const visibleCourses = filterState.items.slice(0, visibleRange.end);
    const hasMoreCoursesToLoad = visibleRange.end < filterState.items.length;
    return { visibleCourses, hasMoreCoursesToLoad };
  }, [filterState.items, visibleRange.end]);

  // Reset visible range when filtered courses change
  useEffect(() => {
    if (filterState.isSearching) return;
    setVisibleRange({ start: 0, end: Math.min(20, filterState.items.length) });
  }, [filterState.items, filterState.isSearching]);

  // Load more courses handler
  const loadMoreCourses = useCallback(() => {
    if (isLoadingMore || !hasMoreCoursesToLoad) return;

    setIsLoadingMore(true);
    // Use setTimeout to simulate async operation and prevent UI blocking
    setTimeout(() => {
      setVisibleRange((prev) => ({
        start: prev.start,
        end: Math.min(prev.end + 10, filterState.items.length),
      }));
      setIsLoadingMore(false);
    }, 300);
  }, [filterState.items.length, hasMoreCoursesToLoad, isLoadingMore]);

  // Toggle course expansion
  const toggleCourse = useCallback((courseId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  }, []);

  // Handle local search clearing
  const clearLocalSearch = useCallback(() => {
    setLocalSearch('');
    if (handleClearSearch) {
      handleClearSearch();
    }
  }, [handleClearSearch]);

  // Set up IntersectionObserver for infinite scrolling
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMoreCoursesToLoad && !isLoadingMore) {
          loadMoreCourses();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '250px 0px',
      },
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMoreCoursesToLoad, isLoadingMore, loadMoreCourses]);

  // Find and attach scroll handler to the ScrollArea viewport
  useEffect(() => {
    // First try to find the ScrollArea viewport directly
    const findScrollableViewport = () => {
      if (scrollContainerRef.current) {
        // Look for viewport element within ScrollArea
        const viewport = scrollContainerRef.current.querySelector(
          '[data-radix-scroll-area-viewport]',
        );
        if (viewport) {
          return viewport as HTMLElement;
        }
      }
      return null;
    };

    // Try to find the scrollable viewport
    const scrollElement = findScrollableViewport();
    if (scrollElement) {
      scrollAreaViewportRef.current = scrollElement as HTMLDivElement;
    }

    // If we found a scrollable element, attach the scroll handler
    if (scrollAreaViewportRef.current) {
      const handleScroll = () => {
        if (!scrollAreaViewportRef.current || isLoadingMore) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollAreaViewportRef.current;
        const scrollBottom = scrollTop + clientHeight;
        const nearBottom = scrollHeight - scrollBottom < 200; // 200px threshold

        if (nearBottom && hasMoreCoursesToLoad) {
          loadMoreCourses();
        }
      };

      scrollAreaViewportRef.current.addEventListener('scroll', handleScroll);
      return () => {
        scrollAreaViewportRef.current?.removeEventListener('scroll', handleScroll);
      };
    }
  }, [hasMoreCoursesToLoad, isLoadingMore, loadMoreCourses]);

  return (
    <div className={cn('w-full h-full max-h-full overflow-hidden', 'flex flex-col gap-4')}>
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0',
        )}
      >
        <div className='flex items-center'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            {filterState.isSearching ? (
              <span className='flex items-center'>
                Searching... <Loader2 className='ml-2 h-3 w-3 inline animate-spin' />
              </span>
            ) : (
              `${filterState.items.length} ${
                filterState.items.length === 1 ? 'course' : 'courses'
              } found`
            )}
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
              <Input
                className='mb-2'
                name='search-mobile-dropdown'
                value={localSearch}
                placeholder='Filter results...'
                onChange={handleSearchChange}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop search input */}
          <div className='relative flex-1 sm:flex-initial hidden sm:block'>
            <Input
              ref={searchInputRef}
              value={localSearch}
              className='w-full sm:w-[200px] pl-8'
              placeholder='Filter results...'
              onChange={handleSearchChange}
            />
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            {localSearch && (
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-1 top-1 h-7 w-7'
                onClick={clearLocalSearch}
                type='button'
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
              onChange={handleSearchChange}
              name='search-mobile'
            />
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Button
              hidden={!localSearch || localSearch.length === 0}
              variant='ghost'
              size='icon'
              className='absolute right-1 top-1 h-7 w-7'
              onClick={clearLocalSearch}
              type='button'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      <div
        hidden={filterState.items.length !== 0 || filterState.isSearching}
        className='text-center'
      >
        <h3 className='font-medium text-base sm:text-lg'>No courses found</h3>
        <p className='text-sm sm:text-base text-muted-foreground mt-1'>
          Try adjusting your search criteria
        </p>
      </div>

      <div
        hidden={filterState.items.length === 0 && !filterState.isSearching}
        className={cn('flex-1', 'w-full h-full overflow-hidden')}
      >
        <div className='w-full h-full max-h-full overflow-hidden'>
          <div
            ref={scrollContainerRef}
            className='w-full h-full'
            hidden={filterState.items.length === 0 && !filterState.isSearching}
          >
            <ScrollArea className={cn('max-h-full', 'w-full h-full overflow-auto')} type='auto'>
              <div className='pr-3 flex flex-col space-y-2'>
                {/* Show loading placeholder when searching */}
                {filterState.isSearching && (
                  <div className='py-8 text-center'>
                    <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
                    <p className='text-sm text-muted-foreground'>Searching for courses...</p>
                  </div>
                )}

                {/* Course list */}
                {!filterState.isSearching &&
                  visibleCourses.map((course) => {
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

                {/* Loading indicator - only show when there are more courses to load */}
                {!filterState.isSearching && hasMoreCoursesToLoad && (
                  <div ref={loaderRef} className='py-4 text-center'>
                    <Loader2 className='h-5 w-5 animate-spin mx-auto mb-2' />
                    <p className='text-xs text-muted-foreground'>Loading more courses...</p>
                  </div>
                )}

                {/* End of list indicator */}
                {!filterState.isSearching &&
                  !hasMoreCoursesToLoad &&
                  filterState.items.length > 0 && (
                    <div className='py-4 text-center text-xs text-muted-foreground'>
                      End of course list
                    </div>
                  )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};
