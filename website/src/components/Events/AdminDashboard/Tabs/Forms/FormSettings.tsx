import FormBuilder from "@/components/Form/FormBuilder";
import { ToastType, useToast } from "@/components/Toast/ToastContext";
import { deleteForm, updateForm } from "@/services/FormService";
import { FormStructure } from "@/types/models/Form";
import { useState } from "react";

interface FormSettingsProps {
  form: FormStructure;
  onDelete: () => void;
  changeForm: (form: FormStructure) => void;
}

const FormSettings: React.FC<FormSettingsProps> = ({ form, onDelete, changeForm }) => {
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

  const formSettingStructure: FormStructure = {
    attrs: [
      {
        question: 'Form Status',
        type: 'radio',
        key: 'status',
        required: true,
        options: ["draft", "published", "closed", "archived"],
        defaultOptions: [form.status ? form.status : "draft"],
      },
    ],
  };

  const handleSubmit = (formData: Record<string, any>) => {
    form.status = formData.status;
    updateForm(form.id || "", form).then(() => {
        showToast("Successfully updated form!", ToastType.Success);
        changeForm(form);
    }).catch((err) => {});
  };

  return (
    <>
      <FormBuilder formStructure={formSettingStructure} submissionFunction={handleSubmit} buttonText='Save' />

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
                onClick={() => handleDeleteForm(form.id)}
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
