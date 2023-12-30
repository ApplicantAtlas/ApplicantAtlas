import React, { useState } from "react";
import FormBuilder from "@/components/Form/FormBuilder";
import { FormStructure, FormField, FormFieldType } from "@/types/models/Form";

interface FieldAttributesFormProps {
  fieldType: string;
  onAddField: (field: FormField) => void;
}

const FieldAttributesForm: React.FC<FieldAttributesFormProps> = ({ fieldType, onAddField }) => {
  const [formFields, setFormFields] = useState<FormStructure>();

  // This effect updates the form structure based on the selected field type
  React.useEffect(() => {
    const formStructure = createFormStructure(fieldType);
    setFormFields(formStructure);
  }, [fieldType]);

  const createFormStructure = (fieldType: string): FormStructure => {
    // Define the form structure based on the selected field type
    // Here you can customize the structure for each field type
    return {
      attrs: [
        {
          key: "question",
          question: "Field Label/Question",
          type: "text",
          required: true,
        },
        {
          key: "defaultValue",
          question: "Default Value",
          type: fieldType === 'number' ? 'number' : 'text', // Example of customizing based on field type
          required: false,
        },
        {
          key: "required",
          question: "Is this field required?",
          type: "checkbox",
          required: false,
        },
        // Add more field attributes as needed
      ],
    };
  };

  const handleFormSubmission = (formData: Record<string, any>) => {
    // Construct the new field object from formData
    const newField: FormField = {
      question: formData.question,
      type: fieldType as FormFieldType,
      key: formData.question.toLowerCase().replace(/ /g, "_"),
      defaultValue: formData.defaultValue,
      required: formData.required === true,
      // Add additional attributes here if needed
    };

    // Call the onAddField function passed from FormCreator
    onAddField(newField);
  };

  if (!formFields) {
    return <div>Loading...</div>;
  }

  return (
    <FormBuilder
      formStructure={formFields}
      submissionFunction={handleFormSubmission}
    />
  );
};

export default FieldAttributesForm;
