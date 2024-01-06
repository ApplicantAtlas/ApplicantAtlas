import { FormStructure } from "@/types/models/Form";
import api from "./AxiosInterceptor";
import { AxiosResponse } from "axios";

export const getSelectorOptions = async (name: string): Promise<string[]> => {
  const response = await api.get<string[]>(
    `/forms/default_selector_values/${name}`
  );
  return response.data;
};

export const getForm = async (id: string): Promise<FormStructure> => {
  const response = await api.get<FormStructure>(`/forms/${id}`);
  return response.data;
};

export const createForm = async (
  form: FormStructure
): Promise<AxiosResponse<{ id: string }>> => {
  return api.post<{ id: string }>("/forms", form);
};

export const updateForm = async (
  id: string,
  form: FormStructure
): Promise<AxiosResponse> => {
  return api.put(`/forms/${id}`, form);
};

export const deleteForm = async (id: string): Promise<AxiosResponse> => {
  return api.delete(`/forms/${id}`);
};
