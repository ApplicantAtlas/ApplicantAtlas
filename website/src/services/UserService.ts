import { AxiosResponse } from "axios";
import api from "./AxiosInterceptor";
import { User } from "@/types/models/User";

export const getUserFull = async (): Promise<User> => {
  const response = await api.get<User>(`/users/me`);
  return response.data;
};

export const updateUser = async (user: User): Promise<AxiosResponse> => {
  const response = await api.put<AxiosResponse>(`/users/me`, user);
  return response.data;
};
