import { useQuery } from '@tanstack/react-query';
import { projectApi } from 'apps/pm-ms-ui/src/lib/api/v2.project';

export const useFetchProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      return await projectApi.list();
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useFetchProjectDetail = (
  id: string,
  viewType: 'summary' | 'board' | 'list' = 'summary',
) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      return await projectApi.get(id);
    },
    staleTime: 1000 * 60 * 5,
  });
};
