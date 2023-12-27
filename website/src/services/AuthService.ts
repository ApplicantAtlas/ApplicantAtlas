// AuthService.ts
import { AxiosResponse } from "axios";
import api from "./AxiosInterceptor";
import { User } from "@/types/models/User";
import {jwtDecode} from 'jwt-decode';

const register = async (u: User): Promise<AxiosResponse> => {
  return api.post(`/auth/register`, u);
};

const login = (u: User): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post<{ token: string }>(`/auth/login`, u);
      const tok = response.data.token;
      localStorage.setItem('token', tok);

      const decoded: User = jwtDecode<User>(tok);
      localStorage.setItem('user', JSON.stringify(decoded));
      resolve(decoded);
    } catch (error) {
      reject(error);
    }
  });
};

const logout = (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

// Delete self
const deleteUser = async (): Promise<AxiosResponse> => {
    return api.delete(`/auth/delete`);
};

const isAuth = (): boolean => {
  return Boolean(localStorage.getItem('token'));
};

export default {
  register,
  login,
  logout,
  deleteUser,
  isAuth
};