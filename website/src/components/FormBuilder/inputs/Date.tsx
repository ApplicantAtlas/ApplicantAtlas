import React, { useState, useEffect, useRef } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

type DateInputProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  defaultValue?: Date;
};

const DateInput: React.FC<DateInputProps> = ({ field, onChange, defaultValue }) => {
  const formatDateToUTC = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const [value, setValue] = useState<string>(defaultValue ? formatDateToUTC(defaultValue) : '');

  useEffect(() => {
    if (defaultValue) {
      const formattedDate = formatDateToUTC(defaultValue);
      setValue(formattedDate);
      onChange(field.key, defaultValue);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (newValue) {
      const dateValue = new Date(newValue);
      onChange(field.key, dateValue);
    }
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">
          {field.question}{" "}
          {field.required && <span className="text-error">*</span>}
        </span>
      </label>
      <input
        id={field.key}
        type="date"
        value={value}
        className="input input-bordered"
        onChange={handleInputChange}
        required={field.required}
      />
    </div>
  );
};

export default DateInput;
