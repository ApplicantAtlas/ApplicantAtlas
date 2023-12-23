export type FieldValidation = {
  min?: number;
  max?: number;
  isEmail?: boolean;
  isEduEmail?: boolean;
};

export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | Date;

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
    | "checkbox"
    | "radio";
  description?: string;
  additionalValidation?: FieldValidation;
  defaultValue?: FieldValue;
  options?: string[]; // for select, checkbox, radio
  defaultOptions?: string[]; // for select, checkbox, radio
  required?: boolean; // TODO: implement
  disabled?: boolean; // TODO: implement
};

export type FormStructure = {
  attrs: FormField[];
};
