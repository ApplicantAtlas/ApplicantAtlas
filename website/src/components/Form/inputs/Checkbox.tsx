import React, { useEffect, useState } from 'react';

import { FormField, FieldValue } from '@/types/models/Form';
import InformationIcon from '@/components/Icons/InformationIcon';

type CheckboxProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  defaultValue?: boolean;
  inline?: boolean;
};

const Checkbox: React.FC<CheckboxProps> = ({
  field,
  onChange,
  defaultValue,
  inline = false,
}) => {
  const [checked, setChecked] = useState<boolean>(defaultValue || false);

  useEffect(() => {
    onChange(field.key, defaultValue || false);
  }, [defaultValue]); // eslint-disable-line react-hooks/exhaustive-deps -- only want to run this for initial value

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    onChange(field.key, e.target.checked);
  };

  return (
    <>
      {!inline && field.question !== '' && (
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text mr-2">
              {field.question}{' '}
              {field.required && <span className="text-error">*</span>}
              {field.description && (
                <div
                  className="tooltip absolute z-50 tooltip-left md:tooltip-top"
                  data-tip={field.description}
                >
                  <InformationIcon className="h-4 w-4" />
                </div>
              )}
            </span>
          </label>

          <input
            id={field.key}
            type="checkbox"
            checked={checked}
            className="checkbox checkbox-bordered"
            onChange={handleInputChange}
            required={field.required}
          />
        </div>
      )}

      {inline && (
        <div className="flex items-center">
          <label htmlFor={field.key} className="label">
            <span
              className={field.description ? 'label-text pr-4' : 'label-text'}
            >
              {field.question}{' '}
              {field.required && <span className="text-error">*</span>}
              {field.description && (
                <span
                  className="tooltip absolute z-50 tooltip-left md:tooltip-top"
                  data-tip={field.description}
                >
                  <InformationIcon className="h-4 w-4 mr-4" />
                </span>
              )}
            </span>
          </label>

          <input
            id={field.key}
            type="checkbox"
            checked={checked}
            className="checkbox checkbox-bordered"
            onChange={handleInputChange}
            required={field.required}
          />
        </div>
      )}
    </>
  );
};

export default Checkbox;
