import React, { useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment-timezone';

import { FormField, FieldValue } from '@/types/models/Form';
import InformationIcon from '@/components/Icons/InformationIcon';

import Select from './Select';

type TimestampInputProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue, errorString?: string) => void;
  defaultValue?: Date;
};

const TimestampInput: React.FC<TimestampInputProps> = ({
  field,
  onChange,
  defaultValue,
}) => {
  const askTimezone = field.additionalOptions?.showTimezone || false;
  const [timezone, setTimezone] = useState<string>('');
  const [error, setError] = useState<string | undefined>();
  const guessedTz = useState<string>((): string => {
    if (
      field.additionalOptions?.defaultTimezone &&
      field.additionalOptions?.defaultTimezone !== ''
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
    defaultValue: Date | undefined,
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
      ? moment(defaultValue).tz('UTC').format('YYYY-MM-DDTHH:mm')
      : '';
  const [localDateTime, setLocalDateTime] = useState<string>(
    formattedDefaultValue,
  );

  const timezoneOptions = moment.tz.names();

  // TODO: This might be getting re-rendered too much by toast on submission
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
        .format('YYYY-MM-DDTHH:mm');
      setLocalDateTime(formattedDateTime);
      onChange(field.key, defaultValue);
      isInitialized.current = true;
    }
  }, [defaultValue, timezone]); // eslint-disable-line react-hooks/exhaustive-deps -- only want to run this for initial value

  const calculateAge = (date: Date) => {
    let againstDate = Date.now();
    if (field.additionalValidation?.dateAndTimestampFromTimeField) {
      againstDate = new Date(
        field.additionalValidation.dateAndTimestampFromTimeField,
      ).getTime();
    }

    const diff = againstDate - date.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalDateTime(newValue);

    if (newValue && moment(newValue, 'YYYY-MM-DDTHH:mm', true).isValid()) {
      const timestampValue = moment
        .tz(newValue, 'YYYY-MM-DDTHH:mm', timezone)
        .toDate();
      const age = calculateAge(timestampValue);

      let foundError = false;

      if (
        field.additionalValidation?.min !== undefined &&
        age < field.additionalValidation.min
      ) {
        const minAgeError = `Age must be at least ${field.additionalValidation.min} years`;
        setError(minAgeError);
        e.target.setCustomValidity(minAgeError);
        foundError = true;
      } else if (
        field.additionalValidation?.max !== undefined &&
        age > field.additionalValidation.max
      ) {
        const maxAgeError = `Age must be at most ${field.additionalValidation.max} years`;
        setError(maxAgeError);
        e.target.setCustomValidity(maxAgeError);
        foundError = true;
      } else {
        setError(undefined);
        e.target.setCustomValidity('');
      }

      onChange(field.key, timestampValue, foundError ? error : undefined);
    }
  };

  const handleTimezoneChange = (k: string, selectedOption: FieldValue) => {
    if (
      selectedOption &&
      typeof selectedOption === 'string' &&
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
      moment(localDateTime, 'YYYY-MM-DDTHH:mm', true).isValid()
    ) {
      const timestampValue = moment
        .tz(localDateTime, 'YYYY-MM-DDTHH:mm', tz)
        .toDate();
      if (!isInitialized.current) {
        onChange(field.key, timestampValue);
      }
    }
  };

  if (timezone === '') {
    return <div>Loading...</div>;
  }

  // TODO: I want to make the timezone more pretty and inline with the rest of the form
  return (
    <div className="form-control">
      {field.question !== '' && (
        <label className="label">
          <span className="label-text">
            {field.question}{' '}
            {field.required && <span className="text-error">*</span>}
            {field.description && (
              <div className="tooltip" data-tip={field.description}>
                <InformationIcon className="h-4 w-4" />
              </div>
            )}
          </span>
        </label>
      )}
      <input
        id={field.key + '-date-tz'}
        type="datetime-local"
        value={localDateTime}
        className="input input-bordered"
        onChange={handleInputChange}
        required={field.required}
      />
      {!askTimezone ? null : (
        // TODO: fix the ts error
        <Select
          field={{
            ...field,
            key: field.key + '-tz',
            question: 'Select ' + field.question + ' Timezone',
            options: timezoneOptions,
            defaultOptions: defaultOptions,
          }}
          defaultOptions={defaultOptions}
          onChange={(k, value) => handleTimezoneChange(k, value)}
        />
      )}
      {error && <p className="text-error pl-2">{error}</p>}
    </div>
  );
};

export default TimestampInput;
