import { Address } from "./Event";

export type EmailValidationOptions = {
  isEmail?: boolean;
  requireDomain?: string[];
  allowSubdomains?: boolean;
  allowTLDs?: string[];
};

export type FieldValidation = {
  min?: number;
  max?: number;
  isEmail?: EmailValidationOptions;
};

export type AdditionalOptions = {
  [key: string]: string | undefined | boolean;
  defaultTimezone?: string;
  showTimezone?: boolean;
  isPassword?: boolean;
  useDefaultValuesFrom?: "mlh-schools" | undefined;
};

export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | Date
  | Address;

export type FormFieldType =
  | "number"
  | "text"
  | "date"
  | "timestamp"
  | "telephone"
  | "textarea"
  | "select"
  | "multiselect"
  | "customselect"
  | "custommultiselect"
  | "checkbox"
  | "radio"
  | "address"
  | "colorpicker";

export type FormField = {
  question: string;
  type: FormFieldType;
  description?: string;
  additionalValidation?: FieldValidation;
  key: string;
  defaultValue?: FieldValue;
  options?: string[]; // for select, checkbox, radio
  defaultOptions?: string[]; // for select, checkbox, radio
  required?: boolean;
  disabled?: boolean; // TODO: implement
  additionalOptions?: AdditionalOptions;
};

// We have a lot of optional fields here because we want to be able to use FormStructure as a way to define our own forms like login/register
// without having to define every single field
export type FormStructure = {
  attrs: FormField[];
  id?: string;
  allowMultipleSubmissions?: boolean;
  closeSubmissionsAt?: Date;
  openSubmissionsAt?: Date;
  name?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'draft' | 'published' | 'archived' | 'deleted';
  isDeleted?: boolean;
  eventID?: string;
  maxSubmissions?: number; // could be useful for rsvp forms
  webhookURL?: string;
  submissionMessage?: string;
  confirmationEmailTemplateID?: string; // point to collection "email_templates"
};
