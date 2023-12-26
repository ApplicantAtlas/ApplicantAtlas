import { Address } from "./Event";

export type FieldValidation = {
  min?: number;
  max?: number;
  isEmail?: boolean;
  isEduEmail?: boolean;
  isPassword?: boolean;
};

export type AdditionalOptions = {
  [key: string]: string | undefined;
  defaultTimezone?: string
}

export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | Date
  | Address;

export type FormField = {
  question: string;
  type:
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
    | "address";
  description?: string;
  additionalValidation?: FieldValidation;
  key: string;
  defaultValue?: FieldValue;
  options?: string[]; // for select, checkbox, radio
  defaultOptions?: string[]; // for select, checkbox, radio
  required?: boolean; // TODO: implement
  disabled?: boolean; // TODO: implement
  additionalOptions?: AdditionalOptions;
};

export type FormStructure = {
  attrs: FormField[];
};
