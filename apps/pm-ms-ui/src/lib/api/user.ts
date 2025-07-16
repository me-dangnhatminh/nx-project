import { axiosInstance } from './_base';

const getMe = async () => {
  const response = await axiosInstance.get('/users/me');
  return response.data;
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

export const userApi = {
  getMe,
  searchUser,
};
