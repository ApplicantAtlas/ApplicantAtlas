import React, { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

type SelectProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  isMultiSelect?: boolean;
};

const Select: React.FC<SelectProps> = ({
  field,
  onChange,
  isMultiSelect = false,
}) => {
  // Transform the options into the format expected by react-select
  const options =
    field.options?.map((option) => ({ label: option, value: option })) || [];

  useEffect(() => {
    if (
      field.defaultOptions?.length !== undefined &&
      field.defaultOptions.length > 0
    ) {
      if (isMultiSelect) {
        onChange(field.question, field.defaultOptions);
      } else {
        onChange(field.question, field.defaultOptions[0]);
      }
    }
  }, [field.defaultOptions]);

  // Transform the defaultOptions into the format expected by react-select
  const defaultValue = isMultiSelect
    ? field.defaultOptions?.map((option) => ({ label: option, value: option }))
    : options.find((option) => option.value === field.defaultOptions?.[0]);

  const handleChange = (selectedOption: any) => {
    if (isMultiSelect) {
      setSelectedValue(selectedOption);
      onChange(
        field.question,
        selectedOption.map((opt: any) => opt.value)
      );
    } else {
      setSelectedValue(selectedOption);
      onChange(field.question, selectedOption.value);
    }
  };

  const [selectedValue, setSelectedValue] = useState(defaultValue);

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.question}</span>
      </label>
      <ReactSelect
        isMulti={isMultiSelect}
        options={options}
        value={selectedValue}
        onChange={handleChange}
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default Select;
