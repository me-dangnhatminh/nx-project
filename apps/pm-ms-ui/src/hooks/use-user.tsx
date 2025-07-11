import { createStore } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { userApi } from 'apps/pm-ms-ui/src/lib/api/user';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

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
