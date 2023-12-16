// AuthService.ts
import { AxiosResponse } from "axios";
import api from "./AxiosInterceptor";
import { User } from "@/types/User";
import {jwtDecode} from 'jwt-decode';

const register = async (u: User): Promise<AxiosResponse> => {
  return api.post(`/auth/register`, u);
};

const login = async (u: User): Promise<User> => {
  const response = await api.post<{
    token: string;
  }>(`/auth/login`, u);
  const tok = response.data.token;
  localStorage.setItem('token', tok);

  const decoded: User = jwtDecode<User>(tok); 
  localStorage.setItem('user', JSON.stringify(decoded));

  return decoded;
};

const logout = (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

// Delete self
const deleteUser = async (): Promise<AxiosResponse> => {
    return api.post(`/auth/delete`);
};

const isAuth = (): boolean => {
  return Boolean(localStorage.getItem('user'));
};

export default {
  register,
  login,
  logout,
  deleteUser,
  isAuth
};