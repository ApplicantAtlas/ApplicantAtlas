import { FormStructure } from "@/types/models/Form";
import api from "./AxiosInterceptor";
import { AxiosResponse } from "axios";
import { FormResponse } from "@/types/models/Response";

export const GetResponses = async (
  formID: string,
): Promise<
  AxiosResponse<{
    responses: Record<string, any>;
    columnOrder: string[];
  }>
> => {
  return api.get(`/forms/${formID}/responses`);
};

export const SubmitResponse = async (
  formID: string,
  data: Record<string, any>,
): Promise<AxiosResponse<{ id: string }>> => {
  return api.post(`/forms/${formID}/responses`, data);
};

export const UpdateResponse = async (
  formID: string,
  responseID: string,
  data: Record<string, any>,
): Promise<AxiosResponse<{ id: string }>> => {
  return api.put(`/forms/${formID}/responses/${responseID}`, data);
}

export const DownloadResponses = async (
    formID: string,
    ): Promise<AxiosResponse<Blob>> => {
    return api.get(`/forms/${formID}/responses/csv`, {
        responseType: "blob",
    });
}