'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, MenuIcon, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Tabs, TabsList, TabsTrigger } from '@shadcn-ui/components/tabs';
import { Badge } from '@shadcn-ui/components/badge';
import { Button } from '@shadcn-ui/components/button';

import { cn } from '@shared/utils';
import { checkScheduleConflicts } from '@shared/utils/dtutool';
import { SelectedClassroom } from '@shared/types/dtutool';

import { dtutoolApi } from '@dtutool/apis';
import { RegistrationSummary, CourseSelectionCard } from '../../components/registration';
import { CopyLinkButton } from '../../components/registration/copy-link-button';
import { useURLParamsSetter } from '../../hooks';
import { ScreenLoading } from '../../components/common/screen-loading';
import { SwipeSheet } from '../../components/common/swipe-sheet';

const TabCalendar = dynamic(() => import('./tab-calendar'), { ssr: false });
const TabSearch = dynamic(() => import('./tab-search'), { ssr: false });
const PageHeader = dynamic(() => import('./page-header'), { ssr: false });

type CourseRegistrationState = {
  academic: string;
  semester: string;
  tab: 'search' | 'calendar';
  selectedClassrooms: SelectedClassroom[];
  activeClassroomIdxs: boolean[];
};

export default function PageClient() {
  const searchParams = useSearchParams();
  const setURLParams = useURLParamsSetter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [state, setState] = useState<CourseRegistrationState>({
    tab: 'search',
    academic: '',
    semester: '',
    selectedClassrooms: [],
    activeClassroomIdxs: [],
  });

  const getURLParams = useCallback(() => {
    if (!searchParams) return;

    let academic = searchParams.get('a');
    let semester = searchParams.get('s');
    let tab = searchParams.get('t') as 'search' | 'calendar';
    const cr = searchParams.get('cr'); // classrooms ids
    let as = searchParams.get('as'); // active status eg: '1011'

    // Validate academic
    const currentYear = new Date().getFullYear();
    if (academic) {
      const regex = /(\d{4})-(\d{4})/;
      const match = academic.match(regex);
      if (!match || parseInt(match[1]) >= parseInt(match[2])) {
        academic = `${currentYear - 1}-${currentYear}`;
      }
    } else {
      academic = `${currentYear - 1}-${currentYear}`;
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    if (semester && !semester && ['1', '2', '3'].includes(semester)) {
      semester = month >= 8 && month <= 12 ? '1' : '2';
    }
    // Validate tab
    if (tab !== 'calendar' && tab !== 'search') tab = 'search';

    const classrooms = cr?.split('|').map((id) => id.trim());
    let actives: boolean[] | undefined = undefined;

    if (classrooms) {
      if (as) {
        as = as.replace(/[^01]/g, '1');
        actives = as.split('').map((c) => c === '1');
      } else actives = [];

      const missLeng = classrooms.length - actives.length;
      if (missLeng > 0) {
        const miss = new Array<boolean>(missLeng).fill(true);
        actives = actives.concat(miss);
      } else if (missLeng < 0) {
        actives = actives.slice(0, classrooms.length);
      }
    }

    return { tab, academic, semester, classrooms, actives };
  }, [searchParams]);

  useEffect(
    () => {
      const { tab, academic, semester, selectedClassrooms, activeClassroomIdxs } = state;
      if (academic == '' || state.semester == '') return;

      const classrooms = selectedClassrooms.map(({ registration }) => registration.regId);
      const actives = activeClassroomIdxs;

      setURLParams({ tab, academic, semester, classrooms, actives });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      state.tab,
      state.academic,
      state.semester,
      state.selectedClassrooms,
      state.activeClassroomIdxs,
    ],
  );

  useEffect(() => {
    const params = getURLParams();
    if (!params) return;

    const activeClassroomIdxs: boolean[] = params.actives || [];
    const tab = params.tab || 'search';

    const now = new Date();
    const yearNow = now.getFullYear();
    const monthNow = now.getMonth() + 1;

    const academic = params.academic || `${yearNow - 1}-${yearNow}`;
    let semester = params.semester;
    if (!semester) {
      semester =
        params.semester ||
        (monthNow >= 8 && monthNow <= 12 ? '1' : monthNow >= 1 && monthNow <= 5 ? '2' : '3');
    }

    if (params.classrooms?.length) {
      dtutoolApi
        .getClassroomsByRegIds({
          academic,
          semester,
          regIds: params.classrooms,
        })
        .then((data) => {
          const selectedClassrooms: SelectedClassroom[] = data
            .filter((v) => v !== null)
            .map(({ classrooms, courseInfo: course }) => {
              const filtered = classrooms?.filter(Boolean);
              return filtered?.map((c) => ({ ...c, course })) ?? [];
            })
            .flat();

          const actives = new Array<boolean>(selectedClassrooms.length)
            .fill(false)
            .map((_, idx) => activeClassroomIdxs[idx] ?? false);

          setState({
            tab,
            academic,
            semester,
            selectedClassrooms,
            activeClassroomIdxs: actives,
          });
        })
        .catch((err) => {
          console.error(err);
          setState({
            tab,
            academic,
            semester,
            selectedClassrooms: [],
            activeClassroomIdxs: [],
          });
        });
    } else {
      setState({
        tab,
        academic,
        semester,
        selectedClassrooms: [],
        activeClassroomIdxs: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleConflicts = useMemo(() => {
    if (!state.selectedClassrooms.length) return [];
    const activeClassrooms = state.selectedClassrooms.filter((_, idx) => {
      return state.activeClassroomIdxs[idx];
    });
    if (activeClassrooms.length < 2) return [];
    return checkScheduleConflicts(activeClassrooms);
  }, [state.selectedClassrooms, state.activeClassroomIdxs]);

  const handleTabChange = (tab: string) => {
    if (tab === 'search' || tab === 'calendar') {
      setState((prev) => ({ ...prev, tab: tab as 'search' | 'calendar' }));
      // Close sidebar on mobile when changing tabs
      setSidebarOpen(false);
    } else console.warn(`Invalid tab value: ${tab}`);
  };

  const renderSidebarContent = () => (
    <div className='flex flex-col space-y-6'>
      <RegistrationSummary
        activeClassroomIdxs={state.activeClassroomIdxs}
        selectedClassrooms={state.selectedClassrooms}
        scheduleConflicts={scheduleConflicts}
      />

      <CourseSelectionCard
        tab={state.tab}
        setTab={handleTabChange}
        activeClassroomIdxs={state.activeClassroomIdxs}
        selectedClassrooms={state.selectedClassrooms}
        scheduleConflicts={scheduleConflicts}
        onRemoveClassroom={(regId) => {
          setState((prev) => {
            // Find the index of the classroom to remove
            const idx = prev.selectedClassrooms.findIndex((s) => s.registration.regId === regId);

            if (idx === -1) return prev;

            const selectedClassrooms = [...prev.selectedClassrooms];
            const activeClassroomIdxs = [...prev.activeClassroomIdxs];
            selectedClassrooms.splice(idx, 1);
            activeClassroomIdxs.splice(idx, 1);
            return { ...prev, selectedClassrooms, activeClassroomIdxs };
          });
        }}
        onClassroomActive={(idxs) => {
          setState((prev) => {
            const activeClassroomIdxs = [...prev.activeClassroomIdxs];
            idxs.forEach((idx) => {
              if (idx >= 0 && idx < activeClassroomIdxs.length) {
                activeClassroomIdxs[idx] = true;
              }
            });
            return { ...prev, activeClassroomIdxs };
          });
        }}
        onClassroomInactive={(idxs) => {
          setState((prev) => {
            const activeClassroomIdxs = [...prev.activeClassroomIdxs];
            idxs.forEach((idx) => {
              if (idx >= 0 && idx < activeClassroomIdxs.length) {
                activeClassroomIdxs[idx] = false;
              }
            });

            return { ...prev, activeClassroomIdxs };
          });
        }}
      />
    </div>
  );

  if (!state.academic || !state.semester) return <ScreenLoading loaderClassname='h-6 w-6' />;

  return (
    <div className={cn('w-full h-screen overflow-hidden', 'flex flex-col', 'bg-muted/30')}>
      {/* ============================= DESKTOP ============================= */}
      <div className='w-full h-16 overflow-hidden'>
        <PageHeader
          scheduleConflicts={scheduleConflicts}
          selectedCoursesCount={state.selectedClassrooms.length}
          username='me-dangnhatminh'
        />
      </div>
      <div className='flex-1 w-full h-full overflow-hidden'>
        <div
          className={cn(
            'w-full h-full overflow-hidden',
            'max-w-7xl mx-auto',
            'grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4',
            'p-2 pb-4 sm:pb-2',
          )}
        >
          <div className='w-full h-full overflow-hidden flex flex-col gap-2'>
            <Tabs
              className={cn()}
              defaultValue='search'
              value={state.tab}
              onValueChange={handleTabChange}
            >
              <div className={cn('flex items-center justify-between', 'hidden lg:flex')}>
                <TabsList className='w-full sm:w-auto'>
                  <TabsTrigger value='search' className='flex-1 sm:flex-none'>
                    Search
                  </TabsTrigger>
                  <TabsTrigger value='calendar' className='flex-1 sm:flex-none'>
                    Calendar
                    {scheduleConflicts.length > 0 && (
                      <Badge variant='destructive' className='ml-2'>
                        <AlertCircle className='h-3 w-3 mr-1' />
                        {scheduleConflicts.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <div className='hidden sm:block'>
                  <CopyLinkButton />
                </div>
              </div>
            </Tabs>

            <div className='flex-1 w-full h-full max-w-full overflow-hidden'>
              <div
                className='w-full h-full max-w-full overflow-hidden'
                hidden={state.tab !== 'search'}
              >
                <TabSearch
                  academic={state.academic}
                  semester={state.semester}
                  selectedClassrooms={state.selectedClassrooms}
                  onSelectedAcademic={(academic) => {
                    setState((prev) => ({
                      ...prev,
                      academic,
                      activeClassroomIdxs: [],
                      selectedClassrooms: [],
                    }));
                  }}
                  onSelectedSemester={(semester) => {
                    setState((prev) => ({
                      ...prev,
                      semester,
                      activeClassroomIdxs: [],
                      selectedClassrooms: [],
                    }));
                  }}
                  onAddClassroom={(course, classroom) => {
                    setState((prev) => {
                      const newItem = { ...classroom, course };
                      const regId = classroom.registration.regId;
                      const selecteds = prev.selectedClassrooms;
                      const actives = prev.activeClassroomIdxs;
                      const exitsIdx = selecteds.findIndex((s) => s.registration.regId === regId);
                      if (exitsIdx !== -1) return prev;
                      const selectedClassrooms = [...selecteds, newItem];
                      const activeClassroomIdxs = [...actives, true];
                      return {
                        ...prev,
                        selectedClassrooms,
                        activeClassroomIdxs,
                      };
                    });
                  }}
                />
              </div>

              <div
                className='w-full h-full max-w-full overflow-hidden'
                hidden={state.tab !== 'calendar'}
              >
                <TabCalendar
                  activeClassroomIdxs={state.activeClassroomIdxs}
                  selectedClassrooms={state.selectedClassrooms}
                  scheduleConflicts={scheduleConflicts}
                />
              </div>
            </div>
          </div>

          <div className={cn('hidden lg:block')}>{renderSidebarContent()}</div>
        </div>
      </div>

      {/* ============================= MOBILE ============================= */}

      <SwipeSheet
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        title='Course Selection'
        side='right'
        showCloseButton
      >
        <div className='absolute left-0 top-1/2 -translate-y-1/2 h-24 w-1 bg-primary/10 rounded-r flex items-center justify-center'>
          <ChevronRight className='h-4 w-4 text-muted-foreground opacity-50' />
        </div>

        <h3 className='text-lg font-medium mb-4'>Course Selection</h3>
        {renderSidebarContent()}
      </SwipeSheet>

      <div className='sm:hidden fixed bottom-2 left-0 right-0 flex justify-center z-10'>
        <div className='w-auto bg-background rounded-full shadow-lg p-2 flex space-x-2'>
          <CopyLinkButton />
          <Button
            size='sm'
            variant={state.tab === 'search' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('search')}
          >
            Search
          </Button>

          <Button
            size='sm'
            variant={state.tab === 'calendar' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('calendar')}
          >
            Calendar
          </Button>

          <Button size='sm' className='rounded-full w-8 h-8' onClick={() => setSidebarOpen(true)}>
            <MenuIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
