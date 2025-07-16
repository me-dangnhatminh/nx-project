import { useMutation, useQuery } from '@tanstack/react-query';
import { projectApi } from 'apps/pm-ms-ui/src/lib/api/project';
import { statusApi } from 'apps/pm-ms-ui/src/lib/api/status';

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

export const useFetchProjectStatuses = (projectId: string) => {
  return useQuery({
    queryKey: ['projects', projectId, 'statuses'],
    queryFn: async () => statusApi.list(projectId),
  });
};

export const useReorderProjectStatuses = (projectId: string) => {
  return useMutation({
    mutationKey: ['projects', projectId, 'reorder-statuses'],
    mutationFn: (input: Parameters<typeof statusApi.reorder>[1]) => {
      return statusApi.reorder(projectId, input);
    },
    onSuccess: () => {},
  });
};

export const useFetchProjectTypes = (projectId: string) => {
  return useQuery({
    queryKey: ['projects', projectId, 'types'],
    queryFn: async () => {
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useFetchProjectMembers = (projectId: string) => {
  return useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: async () => {
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });
};
