import { useState } from "react";
import { ToastType, useToast } from "@/components/Toast/ToastContext";
import { EmailTemplate } from "@/types/models/EmailTemplate";
import { UpdateEmailTemplate } from "@/services/EmailTemplateService";
import EmailTemplateEditor from "./EmailTemplateEditor";
import EmailTemplateSettings from "./EmailTemplateSettings";
import { EventModel } from "@/types/models/Event";

interface SelectEmailTemplateProps {
  template: EmailTemplate;
  onDelete: () => void;
  eventDetails: EventModel;
}

const SelectEmailTemplate: React.FC<SelectEmailTemplateProps> = ({
  template,
  onDelete,
  eventDetails
}) => {
  const [pageSelected, setPageSelected] = useState<
    "edit" | "preview" | "settings"
  >("edit");
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>(template);
  const { showToast } = useToast();

  // Edit
  const changeTemplate = (template: EmailTemplate) => {
    setEmailTemplate(template);
  };

  const updateTemplate = (template: EmailTemplate) => {
    UpdateEmailTemplate(template)
      .then(() => {
        showToast("Successfully updated email template!", ToastType.Success);
        setEmailTemplate(template);
      })
      .catch((err) => {});
  };

  const onCopyHTML = () => {
    if (!emailTemplate.body) {
      showToast("Your form does not have a body specified!", ToastType.Error);
      return;
    }

    navigator.clipboard
      .writeText(emailTemplate.body)
      .then(() => {
        showToast("Copied template's body to clipboard.", ToastType.Success);
      })
      .catch((err) => {
        showToast("Could not copy template's body.", ToastType.Error);
      });
  };

  const isActive = (page: string) =>
    page === pageSelected ? "btn-active" : "";

  return (
    <>
      <div className="flex space-x-2 bg-gray-100 p-2 rounded">
        <button
          className={`btn ${isActive("edit")}`}
          onClick={() => setPageSelected("edit")}
        >
          Edit
        </button>
        <button
          className={`btn ${isActive("preview")}`}
          onClick={() => setPageSelected("preview")}
        >
          Preview
        </button>
        <button
          className={`btn ${isActive("settings")}`}
          onClick={() => setPageSelected("settings")}
        >
          Settings
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mt-4 mb-2">
        {template.name}
      </h2>

      {pageSelected === "edit" && (
        <EmailTemplateEditor
          template={emailTemplate}
          onSubmit={updateTemplate}
          eventDetails={eventDetails}
        />
      )}

      {pageSelected === "preview" && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-4">Preview</h3>
          <div className="text-sm mb-4">
            <strong>Note:</strong> This preview may not exactly represent the
            final email appearance. For a more accurate test, please{" "}
            <a
              href="#"
              className="text-primary hover:underline"
              onClick={onCopyHTML}
            >
              copy the HTML
            </a>{" "}
            to your clipboard and use an email testing service.
          </div>
          <div
            className="email-preview"
            style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "4px",
              border: "1px solid #d1d5db", // Tailwind's gray-300
              boxShadow:
                "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              margin: "0 auto", // Centers the div
            }}
            dangerouslySetInnerHTML={{
              __html:
                emailTemplate.body ||
                "<p>The email body content is not specified.</p>",
            }}
          />
        </div>
      )}

      {pageSelected === "settings" && (
        <EmailTemplateSettings
          template={emailTemplate}
          onDelete={onDelete}
          changeTemplate={changeTemplate}
        />
      )}

      {pageSelected !== "edit" &&
        pageSelected !== "settings" &&
        pageSelected !== "preview" && <p>Could not find selected page.</p>}
    </>
  );
};

export default SelectEmailTemplate;
