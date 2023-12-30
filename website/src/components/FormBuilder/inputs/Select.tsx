import React, { useEffect, useState } from "react";
import ReactSelect from "react-select";
import CreatableSelect from "react-select/creatable";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

type SelectProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  isMultiSelect?: boolean;
  allowArbitraryInput?: boolean;
  defaultOptions?: string[];
};

const Select: React.FC<SelectProps> = ({
  field,
  onChange,
  isMultiSelect = false,
  allowArbitraryInput = false,
  defaultOptions = [],
}) => {
  const options =
    field.options?.map((option) => ({ label: option, value: option })) || [];

  // Transform the defaultOptions into the format expected by react-select
  const getDefaultValue = () => {
    return isMultiSelect
      ? defaultOptions?.map((option) => ({ label: option, value: option }))
      : options.find((option) => option.value === defaultOptions?.[0]);
  };

  const [selectedValue, setSelectedValue] = useState(getDefaultValue);

  useEffect(() => {
    setSelectedValue(getDefaultValue());
  }, [defaultOptions]);

  const handleChange = (selectedOption: any) => {
    const value = isMultiSelect
      ? selectedOption.map((opt: any) => opt.value)
      : selectedOption.value;

    setSelectedValue(selectedOption);
    onChange(field.key, value);
  };

  const SelectComponent = allowArbitraryInput ? CreatableSelect : ReactSelect;

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">
          {field.question}{" "}
          {field.required && <span className="text-error">*</span>}
        </span>
      </label>
      <SelectComponent
        id={field.key}
        isMulti={isMultiSelect}
        options={options}
        value={selectedValue}
        onChange={handleChange}
        className="react-select-container"
        classNamePrefix="react-select"
        required={field.required}
      />
    </div>
  );
};

export default Select;
