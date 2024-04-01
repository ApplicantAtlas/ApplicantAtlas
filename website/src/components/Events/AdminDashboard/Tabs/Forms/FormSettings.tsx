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

const FormSettings: React.FC<FormSettingsProps> = ({
  form,
  onDelete,
  changeForm,
}) => {
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

  // TODO: Handle when a default value is provided, but we want to clear it to be undefined
  const formSettingStructure: FormStructure = {
    attrs: [
      {
        question: "Form Name",
        description: "The name of the form",
        type: "text",
        key: "name",
        required: true,
        defaultValue: form.name,
      },
      {
        question: "Form Description",
        description: "The description of the form",
        type: "textarea",
        key: "description",
        required: false,
        defaultValue: form.description,
      },
      {
        question: "Allow Multiple Submissions",
        description: "Allow users to submit the form multiple times",
        type: "checkbox",
        key: "allowMultipleSubmissions",
        required: false,
        defaultValue: form.allowMultipleSubmissions,
      },
      {
        question: "Max Submissions",
        description: "The maximum number of total submissions allowed",
        type: "number",
        key: "maxSubmissions",
        required: false,
        defaultValue: form.maxSubmissions,
      },
      {
        question: "Form Status",
        description: "The status of the form",
        type: "radio",
        key: "status",
        required: true,
        options: ["draft", "published", "closed", "archived"],
        defaultOptions: [form.status ? form.status : "draft"],
      },
      {
        question: "Open Submission Date",
        description: "The date the form will open for submissions",
        type: "timestamp",
        key: "openSubmissionsAt",
        required: false,
        defaultValue: form.openSubmissionsAt,
      },
      {
        question: "Close Submission Date",
        description: "The date the form will close for submissions",
        type: "timestamp",
        key: "closeSubmissionsAt",
        required: false,
        defaultValue: form.closeSubmissionsAt,
      },
      {
        question: "Form Submission Message",
        description: "The message to display after the form is submitted",
        type: "textarea",
        key: "submissionMessage",
        required: false,
        defaultValue: form.submissionMessage,
      },
      {
        question: "Restrict This Form",
        description: "Restrict who can submit the form",
        type: "checkbox",
        key: "isRestricted",
        required: false,
        defaultValue: form.isRestricted,
      },
      {
        question: "Allowed Submitters",
        description:
          "The emails of users allowed to submit the form, this is only applicable if the form is restricted",
        type: "textarea",
        key: "allowedSubmitters",
        required: false,
        defaultValue: form.allowedSubmitters
          ?.map((submitter) => {
            console.log(submitter.expiresAt, typeof submitter.expiresAt )
            return (
              `${submitter.email}` +
              (submitter.expiresAt ? `,expiresAt:${submitter.expiresAt}` : "")
            );
          })
          .join("\n"),
      },
    ],
  };

  const handleSubmit = (formData: Record<string, any>) => {
    var {
      status,
      allowMultipleSubmissions,
      openSubmissionsAt,
      closeSubmissionsAt,
      maxSubmissions,
      submissionMessage,
      name,
      description,
      isRestricted,
      allowedSubmitters,
    } = formData;

    // Parse out allowed submitters
    // TODO: I'd like a better way to format the allowed submitters
    allowedSubmitters = allowedSubmitters
      .split("\n")
      .map((submitter: string) => {
        const [email, expiresAtPart] = submitter.split(",");
        const expiresAt = expiresAtPart
          ? expiresAtPart.split("expiresAt:")[1]
          : undefined;
        return {
          email,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        };
      });

    Object.assign(form, {
      status,
      allowMultipleSubmissions,
      openSubmissionsAt,
      closeSubmissionsAt,
      maxSubmissions,
      submissionMessage,
      name,
      description,
      isRestricted,
      allowedSubmitters,
    });

    updateForm(form.id || "", form)
      .then(() => {
        showToast("Successfully updated form!", ToastType.Success);
        changeForm(form); // idk if needed or not
      })
      .catch((err) => {});
  };

  return (
    <>
      <FormBuilder
        formStructure={formSettingStructure}
        submissionFunction={handleSubmit}
        buttonText="Save"
      />

      <p>
        <button
          className="btn btn-outline btn-error mt-2"
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
              Name: {form.name}
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
