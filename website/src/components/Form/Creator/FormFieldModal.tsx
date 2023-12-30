import React, { useState } from "react";
import { humanFormTypes, fieldDescriptions } from "../FormConstants"; // Assuming fieldDescriptions is an object mapping field types to their descriptions

interface FormFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFieldSelect: (fieldType: string) => void;
}

const FormFieldModal: React.FC<FormFieldModalProps> = ({
  isOpen,
  onClose,
  onFieldSelect,
}) => {
  const [selectedFieldType, setSelectedFieldType] = useState<string | null>(null);

  const handleFieldSelection = (type: string) => {
    setSelectedFieldType(type);
  };

  const handleAddField = () => {
    if (selectedFieldType) {
      onFieldSelect(selectedFieldType);
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <h3 className="text-xl font-bold">Add a new field</h3>
            <div className="flex">
              <div className="flex-1 p-4">
                <ul className="menu bg-base-100 w-full">
                  {humanFormTypes.map((type) => (
                    <li key={type} className={selectedFieldType === type ? "bordered" : ""}>
                      <a onClick={() => handleFieldSelection(type)}>{type}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 p-4">
                {selectedFieldType && (
                  <div>
                    <h4 className="text-lg font-semibold">{selectedFieldType}</h4>
                    <p>{fieldDescriptions[selectedFieldType]}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-action">
              <button onClick={handleAddField} className="btn btn-primary">Add Field</button>
              <button onClick={onClose} className="btn btn-outline">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormFieldModal;
