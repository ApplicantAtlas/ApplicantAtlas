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
  const [timezone, setTimezone] = useState<string>('');
  const [guessedTz, setGuessedTz] = useState<string>(moment.tz.guess());
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

  useEffect(() => {
    const guessedTz = moment.tz.guess();
    console.log('guessedTz', guessedTz)
    setTimezone(guessedTz);
    setGuessedTz(guessedTz);
  }, []);

  useEffect(() => {
    if (
      defaultValue &&
      timezone &&
      isValidDefaultValue(defaultValue) &&
      moment(defaultValue).isValid() &&
      !isInitialized.current
    ) {
      const formattedDateTime = moment(defaultValue)
        .tz(timezone)
        .format("YYYY-MM-DDTHH:mm");
      setLocalDateTime(formattedDateTime);
      console.log("call5", field.key, defaultValue)
      onChange(field.key, defaultValue);
      isInitialized.current = true;
    }
  }, [defaultValue, [timezone]]);

  /*useEffect(() => {
    if (localDateTime && moment(localDateTime, "YYYY-MM-DDTHH:mm", true).isValid()) {
      const timestampValue = moment
        .tz(localDateTime, "YYYY-MM-DDTHH:mm", timezone)
        .toDate();
        console.log("call3", field.key, timestampValue)
      onChange(field.key, timestampValue);
    }
  }, [timezone])*/

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalDateTime(newValue);

    // Delay the onChange to ensure state is updated
    setTimeout(() => {
      if (newValue && moment(newValue, "YYYY-MM-DDTHH:mm", true).isValid()) {
        const timestampValue = moment
          .tz(newValue, "YYYY-MM-DDTHH:mm", timezone)
          .toDate();
          console.log("call6", field.key, timestampValue)
        onChange(field.key, timestampValue);
      }
    }, 0);
  };

  const handleTimezoneChange = (k: string, selectedOption: any) => {
    console.log('handleTimezonechange', k, selectedOption)
    if (selectedOption && typeof selectedOption === "string" && selectedOption !== timezone) {
      console.log('handleTimezoneChange', selectedOption);
      setTimezone(selectedOption);
      updateDateTime(localDateTime, selectedOption);
    }
  };


  /*const updateDateTime = (localDateTime: string, tz: string) => {
    if (
      localDateTime &&
      moment(localDateTime, "YYYY-MM-DDTHH:mm", true).isValid()
    ) {
      const timestampValue = moment
        .tz(localDateTime, "YYYY-MM-DDTHH:mm", tz)
        .toDate();
      onChange(field.key, timestampValue);
    }
  };*/

  const updateDateTime = (localDateTime: string, tz: string) => {
    console.log("updateDateTime", field.key,localDateTime, tz)
    if (
      localDateTime &&
      moment(localDateTime, "YYYY-MM-DDTHH:mm", true).isValid()
    ) {
      console.log('hi')
      const timestampValue = moment
        .tz(localDateTime, "YYYY-MM-DDTHH:mm", tz)
        .toDate();
      console.log("T&")
      if (!isInitialized.current) {
        console.log("call8", field.key, timestampValue)
        onChange(field.key, timestampValue);
      }
    }
    console.log('ret')
  };


  if (timezone === '') {
    return <div>Loading...</div>;
  }

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
    </div>
  );
};

export default TimestampInput;
