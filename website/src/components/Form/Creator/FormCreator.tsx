import React, { useState } from "react";
import { FormStructure, FormField, FormFieldType } from "@/types/models/Form";
import FormFieldModal from "./FormFieldModal";
import FieldAttributesForm from "./FieldAttributesForm";
import { v4 as uuidv4 } from "uuid";

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
  const [selectedFieldType, setSelectedFieldType] =
    useState<FormFieldType | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
    null
  );

  const handleFieldSelect = (fieldType: string) => {
    setSelectedFieldType(fieldType as FormFieldType); // TODO: We need to map human readable like "email" to actual type like text with validations on it
    setModalOpen(false);
  };

  const handleAddField = (field: FormField) => {
    if (editingFieldIndex !== null) {
      // Edit existing field
      const updatedFields = [...userFormStructure.attrs];
      updatedFields[editingFieldIndex] = field;
      setUserFormStructure({ ...userFormStructure, attrs: updatedFields });
      setEditingFieldIndex(null);
    } else {
      // Generate unique id
      field.id = uuidv4();
      field.key = field.id;

      // Add new field
      setUserFormStructure((prev) => ({
        ...prev,
        attrs: [...prev.attrs, field],
      }));
    }
    setSelectedFieldType(null);
  };

  const handleEditField = (index: number) => {
    setEditingFieldIndex(index);
    setSelectedFieldType(userFormStructure.attrs[index].type);
  };

  const handleDeleteField = (index: number) => {
    const updatedFields = userFormStructure.attrs.filter((_, i) => i !== index);
    setUserFormStructure({ ...userFormStructure, attrs: updatedFields });
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...userFormStructure.attrs];
    if (direction === "up" && index > 0) {
      [newFields[index - 1], newFields[index]] = [
        newFields[index],
        newFields[index - 1],
      ];
    } else if (direction === "down" && index < newFields.length - 1) {
      [newFields[index + 1], newFields[index]] = [
        newFields[index],
        newFields[index + 1],
      ];
    }
    setUserFormStructure({ ...userFormStructure, attrs: newFields });
  };

  const handleSubmit = () => {
    submissionFunction(userFormStructure);
  };

  return (
    <div className="space-y-4">
      {userFormStructure.attrs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Current Fields:</h3>
          {userFormStructure.attrs.map((field, index) => (
            <div key={index} className="my-2 p-2 border rounded">
              <p>
                <strong>Question:</strong> {field.question}
              </p>
              <p>
                <strong>Type:</strong> {field.type}
              </p>
              <p>
                <strong>Required:</strong> {field.required ? "Yes" : "No"}
              </p>
              {field.defaultValue && (
                <p>
                  <strong>Default Value:</strong>{" "}
                  {(field.defaultValue as string) || ""}{" "}
                </p>
              )}
              {field.options && (
                <p>
                  <strong>Options:</strong> {field.options.join(", ")}
                </p>
              )}
              <button
                onClick={() => handleEditField(index)}
                className="btn btn-info mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => moveField(index, "up")}
                className="btn btn-secondary mr-2"
              >
                Move Up
              </button>
              <button
                onClick={() => moveField(index, "down")}
                className="btn btn-secondary mr-2"
              >
                Move Down
              </button>
              <button
                onClick={() => handleDeleteField(index)}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="btn btn-primary mt-4"
      >
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
          initialAttributes={
            editingFieldIndex !== null
              ? userFormStructure.attrs[editingFieldIndex]
              : undefined
          }
        />
      )}

      <button onClick={handleSubmit} className="btn btn-secondary mt-4">
        Create Form
      </button>
    </div>
  );
};

export default FormCreator;
