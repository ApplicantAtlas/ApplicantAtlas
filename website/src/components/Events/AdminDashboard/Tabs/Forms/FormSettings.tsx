import { ToastType, useToast } from "@/components/Toast/ToastContext";
import { deleteForm } from "@/services/FormService";
import { FormStructure } from "@/types/models/Form";
import { useState } from "react";

interface FormSettingsProps {
  form: FormStructure;
  onDelete: () => void;
}

const FormSettings: React.FC<FormSettingsProps> = ({ form, onDelete }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { showToast } = useToast();

  const handleDeleteForm = async (formID: string | undefined) => {
    if (!formID) return;

    deleteForm(formID)
      .then(() => {
        showToast("Form deleted successfully", ToastType.Success);
        onDelete();
      })
      .catch(() => {});
  };

  return (
    <>
      <p>
        <button
          className="btn btn-outline btn-error"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          Delete Form
        </button>
      </p>

      {showDeleteConfirmation && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Are you sure you want to delete this form?
              <br />
              Name: {form.id}
            </h3>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={() => handleDeleteForm(form.name)}
              >
                Delete
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormSettings;
