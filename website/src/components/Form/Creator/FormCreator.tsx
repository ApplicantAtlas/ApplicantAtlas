import React, { useState } from "react";
import { FormStructure, FormField } from "@/types/models/Form";
import FormFieldModal from "./FormFieldModal";
import FieldAttributesForm from "./FieldAttributesForm";

type FormCreatorProps = {
  submissionFunction: (formStructure: FormStructure) => void;
  defaultFormStructure?: FormStructure;
};

const FormCreator: React.FC<FormCreatorProps> = ({
  defaultFormStructure,
  submissionFunction,
}) => {
  const [userFormStructure, setUserFormStructure] = useState<FormStructure>(
    defaultFormStructure || { attrs: [] }
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState<string | null>(null);

  const handleFieldSelect = (fieldType: string) => {
    setSelectedFieldType(fieldType);
    setModalOpen(false); // Close the modal after selection
  };

  const handleAddField = (field: FormField) => {
    setUserFormStructure(prev => ({
      ...prev,
      attrs: [...prev.attrs, field],
    }));
    setSelectedFieldType(null); // Reset for the next addition
  };

  const handleSubmit = () => {
    submissionFunction(userFormStructure);
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setModalOpen(true)} className="btn btn-primary">
        Add Field
      </button>

      {modalOpen && (
        <FormFieldModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          onFieldSelect={handleFieldSelect} 
        />
      )}

      {selectedFieldType && (
        <FieldAttributesForm
          fieldType={selectedFieldType}
          onAddField={handleAddField}
        />
      )}

      {userFormStructure.attrs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Current Fields:</h3>
          {userFormStructure.attrs.map((field, index) => (
            <div key={index} className="my-2 p-2 border rounded">
              <p><strong>Question:</strong> {field.question}</p>
              <p><strong>Type:</strong> {field.type}</p>
              {/* Display additional field attributes here */}
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSubmit} className="btn btn-secondary">
        Create Form
      </button>
    </div>
  );
};

export default FormCreator;
