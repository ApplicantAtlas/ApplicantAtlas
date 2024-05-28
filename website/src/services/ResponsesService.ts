import { AxiosResponse } from 'axios';

import api from './AxiosInterceptor';

export const GetResponses = async (
  formID: string,
  getDeletedColumnData: boolean = false
): Promise<
  AxiosResponse<{
    responses: Record<string, any>;
    columnOrder: string[];
  }>
> => {
  return api.get(`/forms/${formID}/responses`, {
    params: {
      getDeletedColumnData: getDeletedColumnData.toString(),
    },
  });
};

export const SubmitResponse = async (
  formID: string,
  data: Record<string, any>
): Promise<AxiosResponse<{ id: string }>> => {
  return api.post(`/forms/${formID}/responses`, data);
};

export const UpdateResponse = async (
  formID: string,
  responseID: string,
  data: Record<string, any>
): Promise<AxiosResponse<{ id: string }>> => {
  return api.put(`/forms/${formID}/responses/${responseID}`, data);
};

export const DownloadResponses = async (
  formID: string,
  getDeletedColumnData: boolean = false
): Promise<AxiosResponse<Blob>> => {
  return api.get(`/forms/${formID}/responses/csv`, {
    responseType: 'blob',
    params: {
      getDeletedColumnData: getDeletedColumnData.toString(),
    },
  });
};
