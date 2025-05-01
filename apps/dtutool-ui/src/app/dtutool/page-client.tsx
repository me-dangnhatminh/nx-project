'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

import dtutoolApi from '@/lib/apis/dtutool-api';
import { checkScheduleConflicts, cn } from '@/lib/utils';
import { SelectedClassroom } from '@/lib/types';

import { RegistrationSummary, CourseSelectionCard } from '@/components';
import { Tabs, TabsList, TabsTrigger } from '@ui/components/tabs';
import { Badge } from '@ui/components/badge';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import { useURLParamsSetter } from '@/hooks';

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
      const {
        tab,
        academic,
        semester,
        selectedClassrooms,
        activeClassroomIdxs,
      } = state;
      if (academic == '' || state.semester == '') return;

      const classrooms = selectedClassrooms.map(
        ({ registration }) => registration.regId
      );
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
    ]
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
        (monthNow >= 8 && monthNow <= 12
          ? '1'
          : monthNow >= 1 && monthNow <= 5
          ? '2'
          : '3');
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

  if (!state.academic || !state.semester) return 'Loading ...';

  return (
    <div className="min-h-screen bg-muted/30">
      <PageHeader
        scheduleConflicts={scheduleConflicts}
        selectedCoursesCount={state.selectedClassrooms.length}
        username="me-dangnhatminh"
      />

      <div
        className={cn(
          'max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8',
          'h-screen min-h-[700px]'
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Tabs
            className="lg:col-span-2"
            defaultValue="search"
            value={state.tab}
            onValueChange={(tab) => {
              if (tab === 'search' || tab === 'calendar') {
                setState((prev) => ({ ...prev, tab }));
              } else console.warn(`Invalid tab value: ${tab}`);
            }}
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="search">Search</TabsTrigger>
                <TabsTrigger value="calendar">
                  Calendar
                  <Badge
                    hidden={!scheduleConflicts.length}
                    variant="destructive"
                    className="ml-2"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Conflicts!
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <CopyLinkButton></CopyLinkButton>
            </div>
            <div hidden={state.tab !== 'search'}>
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
                    const exitsIdx = selecteds.findIndex(
                      (s) => s.registration.regId === regId
                    );
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

            <div hidden={state.tab !== 'calendar'}>
              <TabCalendar
                activeClassroomIdxs={state.activeClassroomIdxs}
                selectedClassrooms={state.selectedClassrooms}
                scheduleConflicts={scheduleConflicts}
              />
            </div>
          </Tabs>

          <div className="flex flex-col space-y-6">
            <RegistrationSummary
              activeClassroomIdxs={state.activeClassroomIdxs}
              selectedClassrooms={state.selectedClassrooms}
              scheduleConflicts={scheduleConflicts}
            />

            <CourseSelectionCard
              tab={state.tab}
              setTab={(tab) => setState((prev) => ({ ...prev, tab }))}
              activeClassroomIdxs={state.activeClassroomIdxs}
              selectedClassrooms={state.selectedClassrooms}
              scheduleConflicts={scheduleConflicts}
              onRemoveClassroom={(regId) => {
                setState((prev) => {
                  // Find the index of the classroom to remove
                  const idx = prev.selectedClassrooms.findIndex(
                    (s) => s.registration.regId === regId
                  );

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
        </div>
      </div>
    </div>
  );
}
