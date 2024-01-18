export type comparison = "eq" | "neq";

// Events
export type FormSubmission = {
  type: "FormSubmission";
  onFormID: string;
};

export type FieldChange = {
  type: "FieldChange";
  onFormID: string;
  onFieldID: string;
  condition: {
    comparison: comparison;
    value: string;
  };
};

// Actions
export type SendEmail = {
  type: "SendEmail";
  id?: string;
  name: string;
  emailTemplateID: string;
  emailFieldID: string;
};

export type AllowFormAccess = {
  type: "AllowFormAccess";
  name:  string;
  id?: string;
  toFormID: string;
  options: {
    expiration: {
      inHoursFromPipelineRun: number;
    };
  };
};

export type Webhook = {
  type: "Webhook";
  name: string;
  id?: string;
  url: string;
  method: "POST" | "GET" | "PUT" | "DELETE";
  headers: {
    [key: string]: string;
  };
};

// Pipeline
export type PipelineEvent = FormSubmission | FieldChange;
export type PipelineAction = SendEmail | AllowFormAccess | Webhook;


export type PipelineConfiguration = {
  id?: string;
  name: string;
  event?: PipelineEvent;
  actions?: PipelineAction[];
  eventID: string;
  updatedAt?: Date;
};
