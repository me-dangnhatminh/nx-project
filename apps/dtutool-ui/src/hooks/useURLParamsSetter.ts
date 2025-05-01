import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';

export const useURLParamsSetter = () => {
  const router = useRouter();

  const setURLParams = useMemo(() => {
    return debounce(
      (params: {
        tab: string;
        academic: string;
        semester: string;
        classrooms: string[];
        actives: boolean[];
      }) => {
        const { tab, academic, semester, classrooms, actives } = params;

        const setterP = [`a=${academic}`, `s=${semester}`, `t=${tab}`];

        if (classrooms.length > 0) setterP.push(`cr=${classrooms.join('|')}`);
        if (actives.length > 0) {
          const activeString = actives
            .map((active) => (active ? '1' : '0'))
            .join('');
          setterP.push(`as=${activeString}`);
        }

        router.replace(`?${setterP.join('&')}`, { scroll: false });
      },
      400
    );
  }, [router]);

  return setURLParams;
};
