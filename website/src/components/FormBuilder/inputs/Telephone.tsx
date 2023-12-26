import React, { useRef, useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

type TelephoneInputProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue, errorMessage?: string) => void;
  defaultValue?: string;
};

const Telephone: React.FC<TelephoneInputProps> = ({
  field,
  onChange,
  defaultValue,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>(defaultValue || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  const handlePhoneNumberChange = (number: string | undefined) => {
    setPhoneNumber(number || "");
    validatePhoneNumber(number);
  };

  const validatePhoneNumber = (number: string | undefined) => {
    const isValid = !number || isValidPhoneNumber(number);
    if (inputRef.current) {
      inputRef.current.setCustomValidity(isValid ? "" : "Invalid phone number");
    }
    if (isValid) {
      onChange(field.key, number as string);
      setError("");
    } else {
      onChange(field.key, "", "Invalid phone number");
      setError("Invalid phone number");
    }
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">
          {field.question}{" "}
          {field.required && <span className="text-error">*</span>}
        </span>
      </label>
      <div className="telephone-input">
        <PhoneInput
          // @ts-ignore
          ref={inputRef}
          id={field.key}
          name={field.question}
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          required={field.required}
          className="input input-bordered max-w-[250px]"
          defaultCountry="US"
        />
        {error && <p className="text-error pl-2">{error}</p>}
      </div>
    </div>
  );
};

export default Telephone;
