import { FormStructure } from "@/types/models/Form";
import api from "./AxiosInterceptor";
import { AxiosResponse } from "axios";
import { FormResponse } from "@/types/models/Response";

export const GetResponses = async (
  formID: string,
): Promise<
  AxiosResponse<{
    responses: FormResponse[];
    form: FormStructure;
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
