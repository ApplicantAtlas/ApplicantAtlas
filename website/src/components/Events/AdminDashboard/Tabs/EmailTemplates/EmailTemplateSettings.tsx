import { ToastType, useToast } from "@/components/Toast/ToastContext";
import { DeleteEmailTemplate } from "@/services/EmailTemplateService";
import { AppDispatch, RootState } from "@/store";
import { resetEmailTemplateState } from "@/store/slices/emailTemplateSlice";
import { EmailTemplate } from "@/types/models/EmailTemplate";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface EmailTemplateSettingsProps {
  onDelete: () => void;
}

const EmailTemplateSettings: React.FC<EmailTemplateSettingsProps> = ({ onDelete }) => {
  const dispatch: AppDispatch = useDispatch();
  const template = useSelector((state: RootState) => state.emailTemplate.emailTemplateState);

  if (template == null) {
    return <p>No email template found in state</p>;
  }
  
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { showToast } = useToast();

  const handleDeleteEmailTemplate = async (templateID: string | undefined) => {
    if (!templateID) return;

    DeleteEmailTemplate(templateID)
      .then(() => {
        showToast("Email template deleted successfully", ToastType.Success);
        onDelete();
        dispatch(resetEmailTemplateState());
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
