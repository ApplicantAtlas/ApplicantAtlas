import { AxiosResponse } from 'axios';

import { FormResponse } from '@/types/models/Response';

import api from './AxiosInterceptor';

export const GetResponses = async (
  formID: string,
  getDeletedColumnData: boolean = false,
  page: number = 1,
  pageSize: number = 10,
): Promise<
  AxiosResponse<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic form responses
    responses: Record<string, any>;
    columnOrder: string[];
    page: number;
    pageSize: number;
  }>
> => {
  return api.get(`/forms/${formID}/responses`, {
    params: {
      getDeletedColumnData: getDeletedColumnData.toString(),
      page,
      pageSize,
    },
  });
};

export const SubmitResponse = async (
  formID: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic form response
  data: Record<string, any>,
): Promise<AxiosResponse<{ id: string }>> => {
  return api.post(`/forms/${formID}/responses`, data);
};

export const UpdateResponse = async (
  response: FormResponse,
): Promise<AxiosResponse<{ id: string; lastUpdatedAt?: string }>> => {
  return api.put(
    `/forms/${response.formID}/responses/${response.id}`,
    response,
  );
};

export const DownloadResponses = async (
  formID: string,
  getDeletedColumnData: boolean = false,
): Promise<AxiosResponse<Blob>> => {
  return api.get(`/forms/${formID}/responses/csv`, {
    responseType: 'blob',
    params: {
      getDeletedColumnData: getDeletedColumnData.toString(),
    },
  });
};
