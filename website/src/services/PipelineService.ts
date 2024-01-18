import { PipelineConfiguration } from "@/types/models/Pipeline";
import api from "./AxiosInterceptor";
import { AxiosResponse } from "axios";

export const CreatePipeline = async (
  pipeline: PipelineConfiguration
): Promise<
  AxiosResponse<{
    id: string;
  }>
> => {
  return api.post(`/pipelines`, pipeline);
};

export const GetPipelines = async (
  eventID: string
): Promise<
  AxiosResponse<{
    pipelines: PipelineConfiguration[];
  }>
> => {
  return api.get(`/events/${eventID}/pipelines`);
};

export const UpdatePipeline = async (
  pipeline: PipelineConfiguration
): Promise<AxiosResponse> => {
  return api.put(`/pipelines/${pipeline.id}`, pipeline);
};

export const DeletePipeline = async (
  pipelineID: string
): Promise<AxiosResponse> => {
  return api.delete(`/pipelines/${pipelineID}`);
};
