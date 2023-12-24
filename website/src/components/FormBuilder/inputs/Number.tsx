import React, { useEffect, useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

type NumberProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  defaultValue?: number;
};

const Number: React.FC<NumberProps> = ({ field, onChange, defaultValue }) => {
  const [value, setValue] = useState<number | undefined>(defaultValue);

  useEffect(() => {
    if (defaultValue !== undefined) {
      onChange(field.key, defaultValue);
    }
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    setValue(value);
    onChange(field.key, value);
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.question}</span>
      </label>
      <input
        type="number"
        value={value}
        placeholder={field.description || ""}
        className="input input-bordered"
        min={field.additionalValidation?.min}
        max={field.additionalValidation?.max}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default Number;
