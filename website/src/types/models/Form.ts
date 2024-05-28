import { Address } from './Event';

export type SelectorSource = {
  _id: string;
  description: string;
  sourceName: string;
  lastUpdated: string;
  options: string[];
};

export type EmailValidationOptions = {
  isEmail?: boolean;
  requireDomain?: string[];
  allowSubdomains?: boolean;
  allowTLDs?: string[];
};

export type FieldValidation = {
  min?: number;
  max?: number;
  dateAndTimestampFromTimeField?: string;
  isEmail?: EmailValidationOptions;
};

export type AdditionalOptions = {
  [key: string]: string | undefined | boolean;
  defaultTimezone?: string;
  showTimezone?: boolean;
  isPassword?: boolean;
  useDefaultValuesFrom?: string | undefined;
  ifInputHTMLKeepHTML?: boolean; // for richtext
};

export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | Date
  | Address
  | undefined;

export type FormFieldType =
  | 'number'
  | 'text'
  | 'date'
  | 'timestamp'
  | 'telephone'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'customselect'
  | 'custommultiselect'
  | 'checkbox'
  | 'radio'
  | 'address'
  | 'colorpicker'
  | 'richtext';

export type FormOptionCustomLabelValue = {
  label: string;
  value: string;
};

export type FormField = {
  question: string;
  type: FormFieldType;
  description?: string;
  additionalValidation?: FieldValidation;
  key: string;
  defaultValue?: FieldValue;
  options?: string[] | FormOptionCustomLabelValue[]; // for select, checkbox, radio
  defaultOptions?: string[] | FormOptionCustomLabelValue[]; // for select, checkbox, radio
  required?: boolean;
  disabled?: boolean; // TODO: implement
  additionalOptions?: AdditionalOptions;
  isInternal?: boolean;
};

export type FormAllowedSubmitter = {
  email: string;
  expiresAt?: Date;
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
  status?: 'draft' | 'published' | 'archived' | 'closed';
  isDeleted?: boolean;
  eventID?: string;
  maxSubmissions?: number; // could be useful for rsvp forms
  submissionMessage?: string;
  isRestricted?: boolean;
  allowedSubmitters?: FormAllowedSubmitter[];
};
