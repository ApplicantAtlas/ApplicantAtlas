import { ToastType, useToast } from "@/components/Toast/ToastContext";
import { DeleteEmailTemplate, UpdateEmailTemplate } from "@/services/EmailTemplateService";
import { EmailTemplate } from "@/types/models/EmailTemplate";
import { useState } from "react";

interface EmailTemplateSettingsProps {
  template: EmailTemplate;
  onDelete: () => void;
  changeTemplate: (template: EmailTemplate) => void;
}

const EmailTemplateSettings: React.FC<EmailTemplateSettingsProps> = ({ template, onDelete, changeTemplate }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { showToast } = useToast();

  const handleDeleteEmailTemplate = async (templateID: string | undefined) => {
    if (!templateID) return;

    DeleteEmailTemplate(templateID)
      .then(() => {
        showToast("Email template deleted successfully", ToastType.Success);
        onDelete();
      })
      .catch(() => {});
  };

  return (
    <>
      <p>
        <button
          className="btn btn-outline btn-error mt-2"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          Delete Pipeline
        </button>
      </p>

      {showDeleteConfirmation && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Are you sure you want to delete this template?
              <br />
              <p>Name: {template.name}</p>
              {template.description && (<p>Description: {template.description}</p>)}
            </h3>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={() => handleDeleteEmailTemplate(template.id)}
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

export default EmailTemplateSettings;
