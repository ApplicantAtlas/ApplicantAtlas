import React, { useEffect, useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

type TextAreaProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue, errorString?: string) => void;
  defaultValue?: string;
};

const TextArea: React.FC<TextAreaProps> = ({
  field,
  onChange,
  defaultValue,
}) => {
  const [value, setValue] = useState<string>(defaultValue || "");

  useEffect(() => {
    if (defaultValue) {
      onChange(field.key, defaultValue);
    }
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(field.key, newValue);
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">
          {field.question}{" "}
          {field.required && <span className="text-error">*</span>}
        </span>
      </label>
      <textarea
        id={field.key}
        value={value}
        placeholder={field.description || ""}
        className="textarea textarea-bordered"
        onChange={handleInputChange}
        required={field.required}
      />
    </div>
  );
};

export default TextArea;
