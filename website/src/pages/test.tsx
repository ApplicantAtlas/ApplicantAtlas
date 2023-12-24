import React from "react";
import FormBuilder from "@/components/FormBuilder/FormBuilder";
import { FormStructure } from "@/types/models/FormBuilder";

const Test: React.FC = () => {
  const formStructure: FormStructure = {
    attrs: [
      { 
        key: "startTime",
        question: "When does your event start?",
        type: "timestamp",
        description: "Please enter the start time of your event",
      },
      {
        key: "telephone",
        question: "What's your telephone?",
        type: "telephone",
        description: "Please enter your telephone",

      },
      {
        key: "email",
        question: "What's your email?",
        type: "text",
        description: "Please enter your email",
        additionalValidation: {
          isEduEmail: true,
        },
      },
      {
        key: "birthday",
        question: "When is your birthday",
        type: "customselect",
        description: "Please enter your birthday",
        options: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
        ],
        defaultOptions: ["October", "November"],
      },
      {
        key: "address",
        question: "What's your address?",
        type: "address",
        description: "Please enter your address",
        defaultValue: {
          street: "2 E Main St",
          city: "Madison",
          country: "United States",
          region: "Wisconsin",
          zipCode: "53703",
        }
      }
    ],
  };

  const handleFormSubmit = (formData: Record<string, any>) => {
    console.log("Form Data:", formData);
  };

  return (
    <FormBuilder
      formStructure={formStructure}
      submissionFunction={handleFormSubmit}
    />
  );
};

export default Test;
