import React, { useState } from "react";
import FormBuilder from "@/components/FormBuilder/FormBuilder";
import { FormStructure, FormField } from "@/types/models/FormBuilder";

type FormCreatorProps = {
  submissionFunction: (formStructure: FormStructure) => void;
  defaultFormStructure?: FormStructure;
};

const formFieldQuestions: FormField[] = [
  { question: "Field Question", type: "text", key: "question", required: true },
  {
    question: "Field Type",
    type: "select",
    key: "type",
    options: [
      "text",
      "number",
      "date",
      "timestamp",
      "select",
      "email",
      "telephone",
      "textarea",
      "radio",
    ],
    required: true,
  },
  { question: "Field Default Value", type: "text", key: "defaultValue" },
  { question: "Field Required", type: "checkbox", key: "required" },
];

const FormCreator: React.FC<FormCreatorProps> = ({
  defaultFormStructure,
  submissionFunction,
}) => {
  const [fieldDefinitions, setFieldDefinitions] = useState<FormStructure[]>([
    { attrs: formFieldQuestions },
  ]);
  const [userFormStructure, setUserFormStructure] = useState<FormStructure>(
    defaultFormStructure || { attrs: [] }
  );

  const addFieldDefinition = () => {
    setFieldDefinitions([...fieldDefinitions, { attrs: formFieldQuestions }]);
  };

  const handleFieldDefinitionSubmit = (
    formData: Record<string, any>,
    index: number
  ) => {
    const newField: any = {
      question: formData.question,
      type: formData.type,
      key: formData.question.toLowerCase().replace(/ /g, "_"),
      required: formData.required,
    };

    if (formData.defaultValue) {
      newField.defaultValue = formData.defaultValue;
    }

    // re-map human native types to generalized types with additional validation
    switch (newField.type) {
        case "email":
            newField.type = "text";
            newField.additionalValidation = {
                isEmail: {
                    isEmail: true,
                },
            };
            break;
        default:
            break;
    }

    const typedNewField = newField as FormField; // cast to FormField type

    // add field to user form structure at index (overwrites existing index if it exists)
    const newUserFormStructure = { ...userFormStructure };
    newUserFormStructure.attrs[index] = typedNewField;
    setUserFormStructure(newUserFormStructure);
  };

  const handleSubmit = () => {
    submissionFunction(userFormStructure);
  };

  return (
    <div>
      {fieldDefinitions.map((formStructure, index) => (
        <FormBuilder
          key={index}
          formStructure={formStructure}
          submissionFunction={(formData) =>
            handleFieldDefinitionSubmit(formData, index)
          }
          buttonText="Save Field"
        />
      ))}
      <button onClick={addFieldDefinition} className="btn btn-primary mt-4">
        Add Another Field
      </button>
      <button onClick={handleSubmit} className="btn btn-secondary mt-4">
        Create Form
      </button>
    </div>
  );
};

export default FormCreator;
