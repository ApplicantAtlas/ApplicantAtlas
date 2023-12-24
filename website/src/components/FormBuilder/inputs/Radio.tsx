import React, { useEffect, useState } from 'react';
import { FormField, FieldValue } from "@/types/models/FormBuilder";

type RadioProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
};

const Radio: React.FC<RadioProps> = ({ field, onChange }) => {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    field.defaultOptions?.[0]
  );

  useEffect(() => {
    if (field.defaultOptions?.length !== undefined && field.defaultOptions.length > 0) {
      onChange(field.key, field.defaultOptions[0]);
    }
  }, [field.defaultOptions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value);
    onChange(field.key, e.target.value);
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.question}</span>
      </label>
      <div className="flex flex-col space-y-2">
        {field.options?.map((option, index) => (
          <label key={index} className="label cursor-pointer">
            <span className="label-text mr-2">{option}</span>
            <input
              id={field.key}
              type="radio"
              name={field.question}
              value={option}
              checked={selectedOption === option}
              className="radio radio-bordered"
              onChange={handleInputChange}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default Radio;
