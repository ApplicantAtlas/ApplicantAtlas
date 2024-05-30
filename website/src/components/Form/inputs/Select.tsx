import React, { useEffect, useState } from 'react';
import ReactSelect from 'react-select';
import CreatableSelect from 'react-select/creatable';

import InformationIcon from '@/components/Icons/InformationIcon';
import {
  FormField,
  FieldValue,
  FormOptionCustomLabelValue,
} from '@/types/models/Form';

type SelectProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  isMultiSelect?: boolean;
  allowArbitraryInput?: boolean;
  defaultOptions?: string[] | FormOptionCustomLabelValue[];
};

const Select: React.FC<SelectProps> = ({
  field,
  onChange,
  isMultiSelect = false,
  allowArbitraryInput = false,
  defaultOptions = undefined,
}) => {
  const options = Array.isArray(field.options)
    ? field.options.map((option) =>
        typeof option === 'string' ? { label: option, value: option } : option,
      )
    : [];

  // Transform the defaultOptions into the format expected by react-select
  const getDefaultValue = () => {
    if (isMultiSelect) {
      // For multi-select, each default option is mapped to an object
      return Array.isArray(defaultOptions)
        ? defaultOptions.map((option) =>
            typeof option === 'string'
              ? { label: option, value: option }
              : option,
          )
        : [];
    } else {
      // For single-select, use the first default option if it exists
      const singleDefaultValue =
        Array.isArray(defaultOptions) && defaultOptions.length > 0
          ? defaultOptions[0]
          : undefined;

      return typeof singleDefaultValue === 'string'
        ? options.find((option) => option.value === singleDefaultValue)
        : singleDefaultValue;
    }
  };

  const [selectedValue, setSelectedValue] = useState(getDefaultValue());

  useEffect(() => {
    const d = getDefaultValue();
    setSelectedValue(d);

    if (d === undefined) return;

    if (Array.isArray(d)) {
      onChange(
        field.key,
        d.map((opt) => opt.value),
      );
    } else {
      onChange(field.key, d.value);
    }
  }, [defaultOptions]); // eslint-disable-line react-hooks/exhaustive-deps -- only want to run this for initial value

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-select types are complex
  const handleChange = (selectedOption: any) => {
    const value = isMultiSelect
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        selectedOption.map((opt: any) => opt.value)
      : selectedOption.value;

    setSelectedValue(selectedOption);
    onChange(field.key, value);
  };

  const SelectComponent = allowArbitraryInput ? CreatableSelect : ReactSelect;

  return (
    <div className="form-control">
      {field.question !== '' && (
        <label className="label">
          <span className="label-text">
            {field.question}{' '}
            {field.required && <span className="text-error">*</span>}
            {field.description && (
              <div
                className="tooltip overflow-x-visible"
                data-tip={field.description}
              >
                <InformationIcon className="h-4 w-4" />
              </div>
            )}
          </span>
        </label>
      )}
      <SelectComponent
        id={field.key}
        isMulti={isMultiSelect}
        options={options}
        value={selectedValue}
        onChange={handleChange}
        className="react-select-container"
        classNamePrefix="react-select"
        required={field.required}
        menuPortalTarget={document.body} // Append the menu to body to avoid clipping issues
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />
    </div>
  );
};

export default Select;
