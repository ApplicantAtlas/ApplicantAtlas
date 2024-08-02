// AuthService.ts
import { AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';
import posthog from 'posthog-js';

import { User } from '@/types/models/User';

import api from './AxiosInterceptor';
import { SendEvent } from './AnalyticsService';

const register = async (u: User): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post<{ token: string }>(`/auth/register`, u);
      const tok = response.data.token;
      localStorage.setItem('token', tok);

      const decoded: User = jwtDecode<User>(tok);
      localStorage.setItem('user', JSON.stringify(decoded));

      posthog.identify(decoded.id, {
        email: decoded.email,
        name: `${decoded.firstName} ${decoded.lastName}`,
      });
      SendEvent('newUser', {
        name: `${u.firstName} ${u.lastName}`,
        id: u.id,
        email: u.email,
      });
      resolve(decoded);
    } catch (error) {
      reject(error);
    }
  });
};

const login = (u: User): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post<{ token: string }>(`/auth/login`, u);
      const tok = response.data.token;
      localStorage.setItem('token', tok);

      const decoded: User = jwtDecode<User>(tok);
      localStorage.setItem('user', JSON.stringify(decoded));

      posthog.identify(decoded.id, {
        email: decoded.email,
        name: `${decoded.firstName} ${decoded.lastName}`,
      });
      resolve(decoded);
    } catch (error) {
      reject(error);
    }
  });
};

const logout = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  posthog.reset();
};

// Delete self
const deleteUser = async (): Promise<AxiosResponse> => {
  return api.delete(`/auth/delete`);
};

const isAuth = (): boolean => {
  return Boolean(localStorage.getItem('token'));
};

const authActions = {
  register,
  login,
  logout,
  deleteUser,
  isAuth,
};

export default authActions;
