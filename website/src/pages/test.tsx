import React from "react";
import FormBuilder from "@/components/FormBuilder/FormBuilder";
import { FormStructure } from "@/types/models/FormBuilder";

// TODO: This is a test page for the form builder. Remove this page when done.

const Test: React.FC = () => {
  const formStructure: FormStructure = {
    attrs: [
      { 
        key: "startTime",
        question: "When does your event start?",
        type: "timestamp",
        description: "Please enter the start time of your event",
        required: false,
      },
      {
        key: "telephone",
        question: "What's your telephone?",
        type: "telephone",
        description: "Please enter your telephone",
        required: false,
      },
      {
        key: "email",
        question: "What's your email?",
        type: "text",
        description: "Please enter your email",
        additionalValidation: {
          isEduEmail: true,
        },
        required: false,
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
          "November",
          "December"
        ],
        required: false,
      },
      {
        key: "address",
        question: "What's your address?",
        type: "address",
        description: "Please enter your address",
        required: false,
      },
      {
        key: "color",
        question: "What's your favorite color?",
        type: "colorpicker",
        description: "Please enter your favorite color",
        required: false,
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
