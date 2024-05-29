import { AxiosResponse } from 'axios';

import { FormStructure, SelectorSource } from '@/types/models/Form';

import api from './AxiosInterceptor';

export const getSelectorOptions = async (name: string): Promise<string[]> => {
  const response = await api.get<string[]>(
    `/forms/selector_sources/values/${name}`,
  );
  return response.data;
};

export const getAllSelectors = async (): Promise<SelectorSource[]> => {
  const response = await api.get<{ sources: SelectorSource[] }>(
    `/forms/selector_sources`,
  );
  return response.data.sources;
};

export const getForm = async (id: string): Promise<FormStructure> => {
  const response = await api.get<{ form: FormStructure }>(`/forms/${id}`);
  return response.data.form;
};

export const createForm = async (
  form: FormStructure,
): Promise<AxiosResponse<{ id: string }>> => {
  return api.post<{ id: string }>('/forms', form);
};

export const updateForm = async (
  id: string,
  form: FormStructure,
): Promise<
  AxiosResponse<{
    message?: string;
    lastUpdatedAt?: string;
  }>
> => {
  return api.put(`/forms/${id}`, form);
};

export const deleteForm = async (id: string): Promise<AxiosResponse> => {
  return api.delete(`/forms/${id}`);
};
