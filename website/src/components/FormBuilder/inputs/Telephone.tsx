import React, { useEffect, useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

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
  const [countryCode, setCountryCode] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>(defaultValue || "");
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    if (defaultValue) {
      const parts = defaultValue.split(" ");
      if (parts.length === 2) {
        setCountryCode(parts[0]);
        setPhoneNumber(parts[1]);
      }
    }
  }, [defaultValue]);

  const handleCountryCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const code = e.target.value;
    setCountryCode(code);
    validatePhoneNumber(code, phoneNumber);
  };

  const handlePhoneNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const number = e.target.value;
    setPhoneNumber(number);
    validatePhoneNumber(countryCode, number);
  };

  const validatePhoneNumber = (code: string, number: string) => {
    // Regular expression for a simple phone number validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;

    if (code && number && phoneRegex.test(number)) {
      setIsValid(true);
      onChange(field.key, `${code} ${number}`);
    } else {
      setIsValid(false);
      onChange(field.key, "");
    }
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.question}</span>
      </label>
      <div className="telephone-input">
        <input
          type="text"
          value={countryCode}
          placeholder="Country Code"
          className={`input input-bordered ${isValid ? "" : "border-red-500"}`}
          onChange={handleCountryCodeChange}
          style={{ width: "100px" }}
        />
        <input
          type="text"
          value={phoneNumber}
          placeholder="Phone Number"
          className={`input input-bordered ${isValid ? "" : "border-red-500"}`}
          onChange={handlePhoneNumberChange}
        />
      </div>
      {!isValid && (
        <p className="text-red-500 text-sm mt-2">
          Please enter a valid phone number.
        </p>
      )}
    </div>
  );
};

export default Telephone;
