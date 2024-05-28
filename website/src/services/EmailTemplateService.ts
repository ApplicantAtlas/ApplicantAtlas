import { AxiosResponse } from 'axios';

import { EmailTemplate } from '@/types/models/EmailTemplate';

import api from './AxiosInterceptor';

export const CreateEmailTemplate = async (
  emailTemplate: EmailTemplate,
): Promise<
  AxiosResponse<{
    id: string;
  }>
> => {
  return api.post(`/email_templates`, emailTemplate);
};

export const GetEmailTemplates = async (
  eventID: string,
): Promise<
  AxiosResponse<{
    email_templates: EmailTemplate[];
  }>
> => {
  return api.get(`/events/${eventID}/email_templates`);
};

export const UpdateEmailTemplate = async (
  emailTemplate: EmailTemplate,
): Promise<AxiosResponse> => {
  return api.put(`/email_templates/${emailTemplate.id}`, emailTemplate);
};

export const DeleteEmailTemplate = async (
  emailTemplateID: string,
): Promise<AxiosResponse> => {
  return api.delete(`/email_templates/${emailTemplateID}`);
};
