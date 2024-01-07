export type comparison = "eq" | "neq";

// Events
export type FormSubmission = {
    onFormID: string;
}

export type FieldChange = {
    onFormID: string;
    onFieldID: string;
    condition: {
        comparison: comparison;
        value: string;
    }
}

// Actions
export type SendEmail = {
    emailTemplateID: string;
}

export type AllowFormAccess = {
    toFormID: string;
    options: {
        expiration: {
            inHoursFromPipelineRun: number;
            reminder: {
                remind: boolean;
                inHoursBeforeExpiration: number;
            }
        };
    }
}

export type Webhook = {
    url: string;
    method: "POST" | "GET" | "PUT" | "DELETE";
    headers: {
        [key: string]: string;
    };
    body: {
        [key: string]: string;
    };
}


// Pipeline
export type PipelineConfiguration = {
  event: FormSubmission | FieldChange;
  actions: (SendEmail | AllowFormAccess | Webhook)[];
  eventID: string;
  updatedAt: Date;
}