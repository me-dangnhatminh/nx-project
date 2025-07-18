import { useQuery } from '@tanstack/react-query';
import { userApi } from 'apps/pm-ms-ui/src/lib/api/user';

export const useUser = (isLoggedIn: boolean = false) => {
  const fetchMe = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userApi.getMe(),
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    fetchMe,
  };
};

export const useUserSearch = (text?: string) => {
  return useQuery({
    queryKey: ['users', 'search', text],
    queryFn: async (): ReturnType<typeof userApi.searchUser> => {
      if (!text) return { items: [] };
      const response = await userApi.searchUser(text);
      return response;
    },
    enabled: !!text,
    staleTime: 0,
    gcTime: 10000,
  });
};
