import { axiosInstance } from './_base';

import { SignUpFormData } from '@shared/types/pmms';

const signUp = async (data: SignUpFormData) => {
  const response = await axiosInstance.post('/auth/signup', data);
  return response.data;
};

const signIn = async (data: { email: string; password: string }) => {
  const response = await axiosInstance.post('/auth/signin', data);
  return response.data;
};

const signOut = async () => {
  const response = await axiosInstance.post('/auth/signout');
  return response.data;
};

export const authApi = {
  signUp,
  signIn,
  signOut,
};
