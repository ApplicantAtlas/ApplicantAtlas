import React, { useEffect, useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";
import moment from 'moment';

type TimestampInputProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  defaultValue?: Date;
};

const TimestampInput: React.FC<TimestampInputProps> = ({
  field,
  onChange,
  defaultValue,
}) => {
  // Format a Date object to a 'YYYY-MM-DDTHH:mm' string in UTC
  const formatTimestampToUTC = (timestamp: Date) => {
    const year = timestamp.getUTCFullYear();
    const month = ("0" + (timestamp.getUTCMonth() + 1)).slice(-2); // Months are 0-indexed
    const day = ("0" + timestamp.getUTCDate()).slice(-2);
    const hours = ("0" + timestamp.getUTCHours()).slice(-2);
    const minutes = ("0" + timestamp.getUTCMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Convert string in 'YYYY-MM-DDTHH:mm' format to a UTC Date object
  const parseTimestampStringToUTC = (timestampString: string) => {
    const [datePart, timePart] = timestampString.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);
    return new Date(Date.UTC(year, month - 1, day, hours, minutes));
  };

  const isValidDefaultValue = (defaultValue: Date | undefined): defaultValue is Date => {
    return defaultValue instanceof Date && 
           !isNaN(defaultValue.getTime()) &&
           moment(defaultValue).isValid() &&
           moment(defaultValue).year() > 1000;
  };

  const [value, setValue] = useState<string>('');

  // TODO: We need to do the onChange c
  useEffect(() => {
    if (isValidDefaultValue(defaultValue)) {
      setValue(formatTimestampToUTC(defaultValue));
    }
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (newValue && moment(newValue, "YYYY-MM-DDTHH:mm", true).isValid()) {
      const timestampValue = parseTimestampStringToUTC(newValue);
      onChange(field.key, timestampValue);
    }
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.question}</span>
      </label>
      <input
        id={field.key}
        type="datetime-local"
        value={value}
        className="input input-bordered"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default TimestampInput;
