import { useQuery } from '@tanstack/react-query';
import { userApi } from 'apps/pm-ms-ui/src/lib/api/user';

export type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
};

export const useMe = (isLoggedIn: boolean = false) => {
  return useQuery<User>({
    enabled: isLoggedIn,
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await userApi.getMe();
      return response.data as {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      }; // TODO: fix as
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
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
