import { AxiosResponse } from 'axios';
import api from './AxiosInterceptor';

type ListEventsResponse = {
    events: EventModel[];
};

type CreateEventResponse = {
    message: string;
    id: string;
};

type UpdateEventResponse = {
    message: string;
};

type ListMyEventsResponse = {
    events: EventModel[];
};

// Service methods
export const listEvents = async (): Promise<AxiosResponse<ListEventsResponse>> => {
    return api.get<ListEventsResponse>(`/events`);
};


type CreateEventRequest = {
    name: string;
};

export const createEvent = async (requestData: CreateEventRequest): Promise<AxiosResponse<CreateEventResponse>> => {
    return api.post<CreateEventResponse>(`/events`, requestData);
};

type UpdateEventMetadataRequest = {
    metadata: EventMetadata;
};

export const updateEvent = async (eventId: string, requestData: UpdateEventMetadataRequest): Promise<AxiosResponse<UpdateEventResponse>> => {
    return api.put<UpdateEventResponse>(`/events/${eventId}`, requestData);
};

export const listMyEvents = async (): Promise<AxiosResponse<ListMyEventsResponse>> => {
    return api.get<ListMyEventsResponse>(`/events/my-events`);
};
