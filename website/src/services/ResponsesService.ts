import { AxiosResponse } from 'axios';

import api from './AxiosInterceptor';

export const GetResponses = async (
  formID: string,
  getDeletedColumnData: boolean = false,
): Promise<
  AxiosResponse<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic form responses
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic form response
  data: Record<string, any>,
): Promise<AxiosResponse<{ id: string }>> => {
  return api.post(`/forms/${formID}/responses`, data);
};

export const UpdateResponse = async (
  formID: string,
  responseID: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic form update response
  data: Record<string, any>,
): Promise<AxiosResponse<{ id: string }>> => {
  return api.put(`/forms/${formID}/responses/${responseID}`, data);
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
