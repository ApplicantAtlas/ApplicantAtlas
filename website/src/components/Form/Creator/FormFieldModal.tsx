import React, { useState } from "react";
import { humanFormTypes } from "../FormConstants";

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
    return (
        <>
          {isOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
              <div className="bg-white rounded-lg shadow-lg p-5 m-4 max-w-xl max-h-full overflow-auto">
                <div className="mb-4">
                  <h3 className="text-xl font-bold">Add a new field</h3>
                  <p className="text-sm text-gray-600">
                    Select the type of field you want to add to your form.
                  </p>
                </div>
                <ul className="menu bg-base-100 w-full overflow-y-auto">
                  {humanFormTypes.map((type) => (
                    <li key={type} onClick={() => onFieldSelect(type)} className="hover:bg-gray-100 cursor-pointer">
                      <a className="text-gray-900 capitalize">{type}</a>
                    </li>
                  ))}
                </ul>
                <div className="modal-action mt-4">
                  <button onClick={onClose} className="btn btn-outline btn-accent w-full">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
};

export default FormFieldModal;
