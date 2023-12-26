import React, { useEffect, useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

type DateInputProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  defaultValue?: Date;
};

// TODO: When gettign sent out to the backend, we should make sure that the date is stored in UTC or bad things will happen

const DateInput: React.FC<DateInputProps> = ({ field, onChange, defaultValue }) => {
  // Format a Date object to a 'YYYY-MM-DD' string in UTC
  const formatDateToUTC = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2); // Months are 0-indexed
    const day = ('0' + date.getUTCDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  // Convert string in 'YYYY-MM-DD' format to a UTC Date object
  const parseDateStringToUTC = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    // Create a date in UTC
    return new Date(Date.UTC(year, month - 1, day));
  };

  // Initialize state with formatted date string or empty string
  const [value, setValue] = useState<string>(
    defaultValue ? formatDateToUTC(defaultValue) : ""
  );

  useEffect(() => {
    if (defaultValue) {
      const formattedDate = formatDateToUTC(defaultValue);
      setValue(formattedDate);
      onChange(field.key, defaultValue);
    }
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (newValue) {
      const dateValue = parseDateStringToUTC(newValue);
      onChange(field.key, dateValue);
    }
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.question}</span>
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
