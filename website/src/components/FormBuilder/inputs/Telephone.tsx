import React, { useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

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

  const handlePhoneNumberChange = (number: string | undefined) => {
    setPhoneNumber(number || "");
    validatePhoneNumber(number);
  };

  const validatePhoneNumber = (number: string | undefined) => {
    // Regular expression for a simple phone number validation (10 digits)
    const phoneRegex = /^(\+|00)[1-9][0-9 \-\(\)\.]{7,32}$/;

    if (number && phoneRegex.test(number)) {
      onChange(field.key, number);
    } else {
      onChange(field.key, "");
    }
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.question}</span>
      </label>
      <div className="telephone-input">
        <PhoneInput
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          required={field.required}
          className="input input-bordered"
          style={{width: '250px'}}
          pattern="^(\+|00)[1-9][0-9 \-\(\)\.]{7,32}$"
          defaultCountry="US"
        />
      </div>
    </div>
  );
};

export default Telephone;
