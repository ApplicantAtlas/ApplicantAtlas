import React, { useEffect, useState } from "react";
import { FormField, FieldValue } from "@/types/models/Form";
import InformationIcon from "@/components/Icons/InformationIcon";

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
      {field.question !== "" && (
        <label className="label cursor-pointer">
          <span className="label-text mr-2">
            {field.question}{" "}
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
        id={field.key}
        type="checkbox"
        checked={checked}
        className="checkbox checkbox-bordered"
        onChange={handleInputChange}
        required={field.required}
      />
    </div>
  );
};

export default Checkbox;
