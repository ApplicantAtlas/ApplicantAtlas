import React, { useState, useEffect } from "react";
import { FormField, FieldValue } from "@/types/models/Form";

type DateInputProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue, errorString?: string) => void;
  defaultValue?: Date;
};

const DateInput: React.FC<DateInputProps> = ({
  field,
  onChange,
  defaultValue,
}) => {
  const formatDateToUTC = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const [value, setValue] = useState<string>(
    defaultValue ? formatDateToUTC(defaultValue) : ""
  );
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (defaultValue) {
      const formattedDate = formatDateToUTC(defaultValue);
      setValue(formattedDate);
      onChange(field.key, defaultValue);
    }
  }, [defaultValue]);

  const calculateAge = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (newValue) {
      const dateValue = new Date(newValue);
      const age = calculateAge(dateValue);

      let foundError = false;

      if (field.additionalValidation?.min !== undefined && age < field.additionalValidation.min) {
        const minAgeError = `Age must be at least ${field.additionalValidation.min} years`;
        setError(minAgeError);
        e.target.setCustomValidity(minAgeError);
        foundError = true;
      } else if (field.additionalValidation?.max !== undefined && age > field.additionalValidation.max) {
        const maxAgeError = `Age must be at most ${field.additionalValidation.max} years`;
        setError(maxAgeError);
        e.target.setCustomValidity(maxAgeError);
        foundError = true;
      } else {
        setError(undefined);
        e.target.setCustomValidity("");
      }

      onChange(field.key, dateValue, foundError ? error : undefined);
    }
  };

  return (
    <div className="form-control">
      {field.question !== "" && (
        <label className="label">
          <span className="label-text">
            {field.question}{" "}
            {field.required && <span className="text-error">*</span>}
          </span>
        </label>
      )}
      <input
        id={field.key}
        type="date"
        value={value}
        className={`input input-bordered ${error ? "input-error" : ""}`}
        onChange={handleInputChange}
        required={field.required}
      />
      {error && <p className="text-error pl-2">{error}</p>}
    </div>
  );
};

export default DateInput;
