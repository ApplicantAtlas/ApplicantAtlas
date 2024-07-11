import React, { useEffect, useState } from 'react';

import {
  FormField,
  FieldValue,
  FormOptionCustomLabelValue,
} from '@/types/models/Form';
import InformationIcon from '@/components/Icons/InformationIcon';

type RadioProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
};

const Radio: React.FC<RadioProps> = ({ field, onChange }) => {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    () => {
      const defaultOption = field.defaultOptions?.[0];
      if (typeof defaultOption === 'string') {
        return defaultOption;
      } else if (defaultOption && typeof defaultOption === 'object') {
        return defaultOption.value;
      }
      return undefined;
    },
  );

  useEffect(() => {
    if (
      field.defaultOptions?.length !== undefined &&
      field.defaultOptions.length > 0
    ) {
      const defaultOption = field.defaultOptions[0];
      if (typeof defaultOption === 'string') {
        onChange(field.key, defaultOption);
      } else if (defaultOption && typeof defaultOption === 'object') {
        onChange(field.key, defaultOption.value);
      }
    }
  }, [field.defaultOptions]); // eslint-disable-line react-hooks/exhaustive-deps -- only want to run this for initial value

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value);
    onChange(field.key, e.target.value);
  };

  const renderOptionLabel = (option: string | FormOptionCustomLabelValue) => {
    if (typeof option === 'string') {
      return option;
    } else if (option && typeof option === 'object') {
      return option.label;
    }
    return '';
  };

  const renderOptionValue = (option: string | FormOptionCustomLabelValue) => {
    if (typeof option === 'string') {
      return option;
    } else if (option && typeof option === 'object') {
      return option.value;
    }
    return '';
  };

  return (
    <div className="form-control">
      {field.question !== '' && (
        <label className="label">
          <span className="label-text">
            {field.question}{' '}
            {field.required && <span className="text-error">*</span>}
            {field.description && (
              <div
                className="tooltip absolute z-50"
                data-tip={field.description}
              >
                <InformationIcon className="h-4 w-4" />
              </div>
            )}
          </span>
        </label>
      )}
      <div className="flex flex-col space-y-2">
        {field.options?.map((option, index) => (
          <label key={index} className="label cursor-pointer">
            <span className="label-text mr-2">{renderOptionLabel(option)}</span>
            <input
              id={field.key}
              type="radio"
              name={field.question}
              value={renderOptionValue(option)}
              checked={selectedOption === renderOptionValue(option)}
              className="radio radio-bordered"
              onChange={handleInputChange}
              required={field.required}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default Radio;
