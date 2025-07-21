import { axiosInstance } from './_base';
import { User } from 'apps/pm-ms-ui/src/lib/types';

const getMe = async () => {
  const response = await axiosInstance.get('/users/me');
  const data = response.data?.data || response.data;
  return data as User;
};

const searchUser = async (text: string) => {
  const response = await axiosInstance.get('/users/search', { params: { text } });
  return response.data as {
    items: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
      picture?: string;
    }[];
  };
};

const getUser = async (
  userId: string,
  params: {
    type: 'project';
  },
) => {
  const response = await axiosInstance.get(`/users/${userId}`, { params });
  const data = response.data?.data || response.data;
  return data;
};

export const userApi = {
  getUser,
  getMe,
  searchUser,
};
