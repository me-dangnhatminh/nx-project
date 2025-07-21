import { useQuery } from '@tanstack/react-query';

export const useProjectPermissions = (
  projectId: string,
  userId: string,
  options?: { enabled?: boolean },
) => {
  const fetchPermissions = useQuery({
    ...options,
    queryKey: ['projectPermissions', projectId, userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/permissions?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      return response.json();
    },
  });

  return {
    fetchPermissions,
  };
};
