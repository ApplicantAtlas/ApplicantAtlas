export type Comparison = 'eq' | 'neq';

export const COMPARISON_VALUES: Record<Comparison, string> = {
  eq: 'Equals',
  neq: 'Not Equals',
};

export type PipelineEvent = {
  id?: string;
  name: string;
  type: string;

  formSubmission?: FormSubmission;
  fieldChange?: FieldChange;
};

// Events
export type FormSubmission = {
  onFormID: string;
};

export type FieldChange = {
  onFormID: string;
  onFieldID: string;
  condition: {
    comparison: Comparison;
    value: string;
  };
};

// Actions
export type PipelineAction = {
  id?: string;
  name: string;
  type: string;

  sendEmail?: SendEmail;
  allowFormAccess?: AllowFormAccess;
  webhook?: Webhook;
};

export type SendEmail = {
  emailTemplateID: string;
  emailFieldID: string;
};

export type AllowFormAccessOptions = {
  expiresInHours?: number;
};

export type AllowFormAccess = {
  toFormID: string;
  options?: AllowFormAccessOptions;
  emailFieldID: string;
};

export type Webhook = {
  url: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  headers: {
    [key: string]: string;
  };
};

export type PipelineConfiguration = {
  id?: string;
  name: string;
  event?: PipelineEvent;
  actions?: PipelineAction[];
  eventID: string;
  updatedAt?: Date;
  enabled: boolean;
};
