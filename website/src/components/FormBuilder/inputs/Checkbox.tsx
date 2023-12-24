import React, { useEffect, useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

type CheckboxProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  defaultValue?: boolean;
};

const Checkbox: React.FC<CheckboxProps> = ({
  field,
  onChange,
  defaultValue,
}) => {
  const [checked, setChecked] = useState<boolean>(defaultValue || false);

  useEffect(() => {
    onChange(field.key, defaultValue || false);
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    onChange(field.key, e.target.checked);
  };

  return (
    <div className="form-control">
      <label className="label cursor-pointer">
        <span className="label-text mr-2">{field.question}</span>
      </label>
      <input
        type="checkbox"
        checked={checked}
        className="checkbox checkbox-bordered"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default Checkbox;
