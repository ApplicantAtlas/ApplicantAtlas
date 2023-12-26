import React, { useEffect, useState } from "react";
import Number from "./inputs/Number";
import DateInput from "./inputs/Date";
import Text from "./inputs/Text";
import Checkbox from "./inputs/Checkbox";
import Radio from "./inputs/Radio";
import Telephone from "./inputs/Telephone";
import AddressInput from "./inputs/Address";
import moment from 'moment';

import {
  FormStructure,
  FieldValue,
  FormField,
} from "@/types/models/FormBuilder";
import TextArea from "./inputs/TextArea";
import dynamic from "next/dynamic";
import { Address, isAddress } from "@/types/models/Event";

const SelectDynamic = dynamic(() => import("./inputs/Select"), {
  ssr: false,
});

const TimestampDynamic = dynamic(() => import("./inputs/Timestamp"), {
  ssr: false,
});

type FormBuilderProps = {
  formStructure: FormStructure;
  submissionFunction: (formJSON: Record<string, any>) => void;
  buttonText?: string;
};

// TODO: Maybe add a way to customize the submit button (optionally abstract it out of the form builder)
// TODO: Add a way to customize the form colors

const FormBuilder: React.FC<FormBuilderProps> = ({
  formStructure,
  submissionFunction,
  buttonText = "Submit",
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [invalidInputs, setInvalidInputs] = useState<Record<string, boolean | undefined>>({});
  const [error, setError] = useState<string | null>("");

  useEffect(() => {
    if (Object.keys(invalidInputs).every((input) => invalidInputs[input] !== false )) {
      setError(null);
    } else {
      setError('Verify all form entries are correct');
    }
  }, [invalidInputs]);

  const handleInputChange = (key: string, value: FieldValue, isValid?: boolean) => {
    setInvalidInputs({ ...invalidInputs, [key]: isValid});
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!error) {
      submissionFunction(formData);
      setError(null);
    }
  };

  const renderFormField = (field: FormStructure["attrs"][number]) => {
    switch (field.type) {
      case "number":
        let defaultNumber: number | undefined;
        switch (typeof field.defaultValue) {
          case "number":
            defaultNumber = field.defaultValue;
            break;
          case "string":
            defaultNumber = parseInt(field.defaultValue);
            break;
          default:
            defaultNumber = undefined;
        }
        return (
          <Number
            field={field}
            onChange={handleInputChange}
            defaultValue={defaultNumber}
          />
        );
      case "date":
        let defaultDate: Date | undefined;
        if (typeof field.defaultValue === "string") {
          defaultDate = new Date(field.defaultValue);
        } else if (field.defaultValue instanceof Date) {
          defaultDate = field.defaultValue as Date;
        }

        // Handle invalid dates
        if (defaultDate && isNaN(defaultDate.getTime())) {
          defaultDate = undefined;
        }

        return (
          <DateInput
            field={field}
            onChange={handleInputChange}
            defaultValue={defaultDate}
          />
        );
      case "text":
        return (
          <Text
            field={field}
            onChange={handleInputChange}
            defaultValue={field.defaultValue as string}
          />
        );
      case "textarea":
        return (
          <TextArea
            field={field}
            onChange={handleInputChange}
            defaultValue={field.defaultValue as string}
          />
        );
      case "checkbox":
        return (
          <Checkbox
            field={field}
            onChange={handleInputChange}
            defaultValue={field.defaultValue as boolean}
          />
        );
      case "radio":
        return <Radio field={field} onChange={handleInputChange} />;
      case "select":
        return (
          <SelectDynamic
            field={field}
            onChange={handleInputChange}
            isMultiSelect={false}
          />
        );
      case "multiselect":
        return (
          <SelectDynamic
            field={field}
            onChange={handleInputChange}
            isMultiSelect={true}
          />
        );
      case "customselect":
        return (
          <SelectDynamic
            field={field}
            onChange={handleInputChange}
            isMultiSelect={false}
            allowArbitraryInput={true}
          />
        );
      case "custommultiselect":
        return (
          <SelectDynamic
            field={field}
            onChange={handleInputChange}
            isMultiSelect={true}
            allowArbitraryInput={true}
          />
        );
      case "telephone":
        return (
          <Telephone
            field={field}
            onChange={handleInputChange}
            defaultValue={field.defaultValue as string}
          />
        );
      case "timestamp":
        let defaultTimestamp: Date | undefined;
        if (typeof field.defaultValue === "string") {
          defaultTimestamp = new Date(field.defaultValue);
        } else if (field.defaultValue instanceof Date) {
          defaultTimestamp = field.defaultValue as Date;
        }

        // Handle invalid dates
        if (defaultTimestamp && isNaN(defaultTimestamp.getTime())) {
          defaultTimestamp = undefined;
        }

        /*if (defaultTimestamp) {
          handleInputChange(field.key, defaultTimestamp);
        }*/
        return (
          <TimestampDynamic
            field={field}
            onChange={handleInputChange}
            defaultValue={defaultTimestamp}
          />
        );
      case "address":
        return (
          <AddressInput
            field={field}
            onChange={handleInputChange}
            defaultValue={field.defaultValue as Address}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {formStructure.attrs.map((field, index) => (
          <div key={index}>{renderFormField(field)}</div>
        ))}
        <span className="flex items-center mt-4">
          <button type="submit" className="btn mr-2">
            {buttonText}
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </span>
      </form>
    </>
  );
};

export default FormBuilder;
