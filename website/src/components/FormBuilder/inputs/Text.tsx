import React, { useEffect, useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

type TextInputProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  defaultValue?: string;
};

const Text: React.FC<TextInputProps> = ({ field, onChange, defaultValue }) => {
  const [value, setValue] = useState<string>(defaultValue || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultValue) {
      onChange(field.question, defaultValue);
    }
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);

    // Email validation
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (field.additionalValidation?.isEmail && !emailPattern.test(inputValue)) {
      setError("Invalid email address");
    } else if (
      field.additionalValidation?.isEduEmail &&
      (!emailPattern.test(inputValue) || !inputValue.endsWith(".edu"))
    ) {
      setError("Invalid EDU email address");
    } else {
      setError(null);
      onChange(field.question, inputValue);
    }
    
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.question}</span>
      </label>
      <input
        type="text"
        value={value}
        placeholder={field.description || ""}
        className={`input input-bordered ${error ? "input-error" : ""}`}
        onChange={handleInputChange}
      />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Text;
