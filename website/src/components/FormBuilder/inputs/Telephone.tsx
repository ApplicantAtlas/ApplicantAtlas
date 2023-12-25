import React, { useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

type TelephoneInputProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  defaultValue?: string;
};

const Telephone: React.FC<TelephoneInputProps> = ({
  field,
  onChange,
  defaultValue,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>(defaultValue || "");
  const [error, setError] = useState<string>("");

  const handlePhoneNumberChange = (number: string | undefined) => {
    setPhoneNumber(number || "");
    validatePhoneNumber(number);
  };

  const validatePhoneNumber = (number: string | undefined) => {
    if (isValidPhoneNumber(number as string)) {
      onChange(field.key, number as string);
      setError("");
    } else {
      onChange(field.key, "");
      setError("Invalid phone number");
    }
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.question}</span>
      </label>
      <div className="telephone-input">
        <PhoneInput
          id={field.key}
          name={field.question}
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          required={field.required}
          className="input input-bordered max-w-[250px]"
          defaultCountry="US"
        />
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default Telephone;
