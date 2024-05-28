import { AxiosResponse } from 'axios';

import { User } from '@/types/models/User';

import api from './AxiosInterceptor';

export const getUserFull = async (): Promise<User> => {
  // We could cache this in 'user'
  const response = await api.get<User>(`/users/me`);
  return response.data;
};

export const getUser = async (userId: string): Promise<User> => {
  const response = await api.get<User>(`/users/${userId}`);
  return response.data;
};

// pulls from localstorage
export const getJWTUser = async (): Promise<User> => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user;
};

export const updateUser = async (user: User): Promise<AxiosResponse> => {
  const response = await api.put<AxiosResponse>(`/users/me`, user);
  return response.data;
};
