import { AxiosResponse } from 'axios';

import { EventMetadata, EventModel } from '@/types/models/Event';
import { FormStructure } from '@/types/models/Form';
import { EventSecrets } from '@/types/models/EventSecret';

import api from './AxiosInterceptor';

type ListEventsResponse = {
  events: EventModel[];
};

type UpdateEventResponse = {
  message: string;
  lastUpdatedAt: string;
};

type ListMyEventsResponse = {
  events: EventModel[];
};

// Service methods
export const listEvents = async (): Promise<
  AxiosResponse<ListEventsResponse>
> => {
  return api.get<ListEventsResponse>(`/events`);
};

type CreateEventRequest = {
  name: string;
};

type CreateEventResponse = {
  message: string;
  id: string;
};

export const createEvent = async (
  requestData: CreateEventRequest,
): Promise<AxiosResponse<CreateEventResponse>> => {
  return api.post<CreateEventResponse>(`/events`, requestData);
};

export const deleteEvent = async (eventId: string): Promise<AxiosResponse> => {
  return api.delete(`/events/${eventId}`);
};

type UpdateEventMetadataRequest = {
  metadata: EventMetadata;
};

export const updateEvent = async (
  eventId: string,
  requestData: UpdateEventMetadataRequest,
): Promise<AxiosResponse<UpdateEventResponse>> => {
  return api.put<UpdateEventResponse>(`/events/${eventId}`, requestData);
};

export const listMyEvents = async (): Promise<
  AxiosResponse<ListMyEventsResponse>
> => {
  return api.get<ListMyEventsResponse>(`/events/my-events`);
};

export const getEvent = async (
  eventId: string,
): Promise<AxiosResponse<{ event: EventModel }>> => {
  return api.get<{ event: EventModel }>(`/events/${eventId}`);
};

export const getEventForms = async (
  eventId: string,
): Promise<AxiosResponse<{ forms: FormStructure[] }>> => {
  return api.get<{ forms: FormStructure[] }>(`/events/${eventId}/forms`);
};

/*
  Event Secrets
*/

export const getEventSecrets = async (
  eventId: string,
): Promise<AxiosResponse<{ eventSecrets: EventSecrets }>> => {
  return api.get<{ eventSecrets: EventSecrets }>(`/events/${eventId}/secrets`);
};

export const createOrUpdateEventSecret = async (
  eventId: string,
  requestData: EventSecrets,
): Promise<AxiosResponse<EventSecrets>> => {
  return api.post<EventSecrets>(`/events/${eventId}/secrets`, requestData);
};

export const deleteEventSecret = async (
  eventId: string,
): Promise<AxiosResponse> => {
  return api.delete(`/events/${eventId}/secrets`);
};

export const addEventAdmin = async (
  eventId: string,
  userEmail: string,
): Promise<
  AxiosResponse<{
    userID: string;
    message: string;
  }>
> => {
  return api.post<{
    userID: string;
    message: string;
  }>(`/events/${eventId}/organizers/${userEmail}`);
};

export const removeEventAdmin = async (
  eventId: string,
  userId: string,
): Promise<AxiosResponse> => {
  return api.delete(`/events/${eventId}/organizers/${userId}`);
};
