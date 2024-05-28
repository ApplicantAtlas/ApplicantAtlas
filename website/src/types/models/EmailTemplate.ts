export type EmailTemplate = {
  id?: string;
  eventID: string;
  dataFromFormID?: string;
  from: string;
  name: string;
  body?: string;
  subject?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  updatedAt?: Date;
  description?: string;
  isHTML?: boolean;
};
