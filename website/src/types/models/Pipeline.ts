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
  ID: string;
  emailTemplateID: string;
  emailFieldID: string;
};

export type AllowFormAccess = {
  type: "AllowFormAccess";
  ID: string;
  toFormID: string;
  options: {
    expiration: {
      inHoursFromPipelineRun: number;
    };
  };
};

export type Webhook = {
  type: "Webhook";
  ID: string;
  url: string;
  method: "POST" | "GET" | "PUT" | "DELETE";
  headers: {
    [key: string]: string;
  };
  body: {
    [key: string]: string;
  };
};

// Pipeline
export type PipelineConfiguration = {
  id?: string;
  name: string;
  event?: FormSubmission | FieldChange;
  actions?: (SendEmail | AllowFormAccess | Webhook)[];
  eventID: string;
  updatedAt?: Date;
};
