import { AxiosResponse } from 'axios';

import { PipelineConfiguration } from '@/types/models/Pipeline';
import { PipelineRun } from '@/types/models/PipelineRun';

import api from './AxiosInterceptor';

export const CreatePipeline = async (
  pipeline: PipelineConfiguration,
): Promise<
  AxiosResponse<{
    id: string;
  }>
> => {
  return api.post(`/pipelines`, pipeline);
};

export const GetPipelines = async (
  eventID: string,
): Promise<
  AxiosResponse<{
    pipelines: PipelineConfiguration[];
  }>
> => {
  return api.get(`/events/${eventID}/pipelines`);
};

export const UpdatePipeline = async (
  pipeline: PipelineConfiguration,
): Promise<AxiosResponse> => {
  return api.put(`/pipelines/${pipeline.id}`, pipeline);
};

export const DeletePipeline = async (
  pipelineID: string,
): Promise<AxiosResponse> => {
  return api.delete(`/pipelines/${pipelineID}`);
};

// Pipeline Runs
export const GetPipelineRuns = async (
  pipelineID: string,
  page?: number,
  pageSize?: number,
): Promise<
  AxiosResponse<{
    runs: PipelineRun[];
    page: number;
    pageSize: number;
  }>
> => {
  return api.get(
    `/pipelines/${pipelineID}/runs?page=${page}&pageSize=${pageSize}`,
  );
};
