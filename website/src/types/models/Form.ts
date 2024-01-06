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
  id: string;
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

export type FormStructure = {
  attrs: FormField[];
};
