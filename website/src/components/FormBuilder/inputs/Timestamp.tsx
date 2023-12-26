import React, { useEffect, useMemo, useRef, useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";
import moment from "moment-timezone";
import Select from "./Select";

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
  const askTimezone = field.additionalOptions?.showTimezone || false;
  const [timezone, setTimezone] = useState<string>("");
  const [guessedTz, setGuessedTz] = useState<string>((): string => {
    if (
      field.additionalOptions?.defaultTimezone &&
      field.additionalOptions?.defaultTimezone !== ""
    ) {
      setTimezone(field.additionalOptions?.defaultTimezone);
      return field.additionalOptions?.defaultTimezone;
    }
    const guessedTz = moment.tz.guess();
    if (guessedTz) {
      setTimezone(guessedTz);
    }
    return guessedTz;
  });

  const defaultOptions = useMemo(() => [guessedTz], [guessedTz]);
  const isInitialized = useRef(false);

  const isValidDefaultValue = (
    defaultValue: Date | undefined
  ): defaultValue is Date => {
    return (
      defaultValue instanceof Date &&
      !isNaN(defaultValue.getTime()) &&
      moment(defaultValue).isValid() &&
      moment(defaultValue).year() > 1000
    );
  };

  const formattedDefaultValue =
    defaultValue &&
    isValidDefaultValue(defaultValue) &&
    moment(defaultValue).isValid()
      ? moment(defaultValue).tz("UTC").format("YYYY-MM-DDTHH:mm")
      : "";
  const [localDateTime, setLocalDateTime] = useState<string>(
    formattedDefaultValue
  );

  const timezoneOptions = moment.tz.names();

  // TODO: This might be getting re-rendered too much by toast on submission
  useEffect(() => {
    if (
      defaultValue &&
      timezone &&
      isValidDefaultValue(defaultValue) &&
      moment(defaultValue).isValid()
    ) {
      const newFormattedDateTime = moment(defaultValue)
        .tz(timezone)
        .format("YYYY-MM-DDTHH:mm");
      if (!isInitialized.current || localDateTime !== newFormattedDateTime) {
        setLocalDateTime(newFormattedDateTime);
        onChange(field.key, defaultValue);
        isInitialized.current = true;
      }
    }
  }, [defaultValue, timezone]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalDateTime(newValue);

    // Delay the onChange to ensure state is updated
    setTimeout(() => {
      if (newValue && moment(newValue, "YYYY-MM-DDTHH:mm", true).isValid()) {
        const timestampValue = moment
          .tz(newValue, "YYYY-MM-DDTHH:mm", timezone)
          .toDate();
        onChange(field.key, timestampValue);
      }
    }, 0);
  };

  const handleTimezoneChange = (k: string, selectedOption: any) => {
    if (
      selectedOption &&
      typeof selectedOption === "string" &&
      selectedOption !== timezone
    ) {
      setTimezone(selectedOption);
      updateDateTime(localDateTime, selectedOption);
      isInitialized.current = false;
    }
  };

  const updateDateTime = (localDateTime: string, tz: string) => {
    if (
      localDateTime &&
      moment(localDateTime, "YYYY-MM-DDTHH:mm", true).isValid()
    ) {
      const timestampValue = moment
        .tz(localDateTime, "YYYY-MM-DDTHH:mm", tz)
        .toDate();
      if (!isInitialized.current) {
        onChange(field.key, timestampValue);
      }
    }
  };

  if (timezone === "") {
    return <div>Loading...</div>;
  }

  // TODO: I want to make the timezone more pretty and inline with the rest of the form
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.question}</span>
      </label>
      <input
        id={field.key + "-date-tz"}
        type="datetime-local"
        value={localDateTime}
        className="input input-bordered"
        onChange={handleInputChange}
      />
      {!askTimezone ? null : (
        <Select
          field={{
            ...field,
            key: field.key + "-tz",
            question: "Select " + field.question + " Timezone",
            options: timezoneOptions,
            defaultOptions: defaultOptions,
          }}
          onChange={(k, value) => handleTimezoneChange(k, value)}
        />
      )}
    </div>
  );
};

export default TimestampInput;
