import React from "react";
import FormBuilder from "@/components/FormBuilder/FormBuilder";
import { FormStructure } from "@/types/models/FormBuilder";

const Test: React.FC = () => {
  const formStructure: FormStructure = {
    attrs: [
      { 
        question: "When does your event start?",
        type: "timestamp",
        description: "Please enter the start time of your event",
      },
      {
        question: "What's your telephone?",
        type: "telephone",
        description: "Please enter your telephone",

      },
      {
        question: "What's your email?",
        type: "text",
        description: "Please enter your email",
        additionalValidation: {
          isEduEmail: true,
        },
      },
      {
        question: "When is your birthday",
        type: "multiselect",
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
