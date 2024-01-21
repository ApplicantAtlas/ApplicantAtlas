import React, { useState } from "react";
import { PipelineAction, PipelineEvent } from "@/types/models/Pipeline";
import {
  FieldValue,
  FormField,
  FormOptionCustomLabelValue,
  FormStructure,
} from "@/types/models/Form";
import FormBuilder from "@/components/Form/FormBuilder";
import Select from "@/components/Form/inputs/Select";
import { toTitleCase } from "@/utils/strings";
import { EmailTemplate } from "@/types/models/EmailTemplate";

interface PipelineActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (action: PipelineAction | PipelineEvent) => void;
  modalType: "action" | "event";
  eventForms?: FormStructure[];
  eventEmailTemplates?: EmailTemplate[];
}

const PipelineActionModal: React.FC<PipelineActionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  modalType,
  eventForms,
  eventEmailTemplates,
}) => {
  const options =
    modalType === "action"
      ? ["SendEmail", "AllowFormAccess", "Webhook"]
      : ["FormSubmission", "FieldChange"];
  const [selectedType, setSelectedType] = useState<string>();

  const createEventObject = (
    formData: Record<string, any>
  ): PipelineEvent | null => {
    switch (selectedType) {
      case "FormSubmission":
        return {
          name: formData.name,
          type: "FormSubmission",
          formSubmission: {
            onFormID: formData.onFormID,
          },
        };
      case "FieldChange":
        return {
          name: formData.name,
          type: "FieldChange",
          fieldChange: {
            onFormID: formData.onFormID,
            onFieldID: formData.onFieldID,
            condition: {
              comparison: "eq", // dropdown
              value: "accepted", // todo: make these out
            },
          },
        };
      default:
        return null;
    }
  };

  const createActionObject = (
    formData: Record<string, any>
  ): PipelineAction | null => {
    switch (selectedType) {
      case "SendEmail":
        return {
          name: formData.name,
          type: "SendEmail",
          sendEmail: {
            emailTemplateID: formData.emailTemplateID,
            emailFieldID: formData.emailFieldID,
          },
        };
      case "AllowFormAccess":
        return {
          name: formData.name,
          type: "AllowFormAccess",
          allowFormAccess: {
            toFormID: formData.toFormID,
            options: {
              expiration: {
                inHoursFromPipelineRun: formData.expiration,
              },
            },
          },
        };
      case "Webhook":
        return {
          name: formData.name,
          type: "Webhook",
          webhook: {
            url: formData.url,
            method: formData.method,
            headers: formData.headers, // Ensure headers are correctly handled
          },
        };
      default:
        return null;
    }
  };

  const handleAddAction = (formData: Record<string, any>) => {
    if (selectedType) {
      const action = createActionObject(formData);
      if (action) {
        onSelect(action);
        onClose();
      }
    }
  };

  const handleAddEvent = (formData: Record<string, any>) => {
    if (selectedType) {
      const event = createEventObject(formData);
      if (event) {
        onSelect(event);
        onClose();
      }
    }
  };

  const renderPipelineEventForm = (t: string | undefined) => {
    if (!t) return null;

    let formStructure: FormStructure | null = null;

    switch (t) {
      case "SendEmail":
        formStructure = createSendEmailFormStructure(
          eventForms,
          eventEmailTemplates
        );
        break;
      case "AllowFormAccess":
        formStructure = createAllowFormAccessFormStructure(eventForms);
        break;
      case "Webhook":
        formStructure = createWebhookFormStructure(eventForms);
        break;
      case "FormSubmission":
        formStructure = createFormSubmissionFormStructure(eventForms);
        break;
      case "FieldChange":
        formStructure = createFieldChangeFormStructure(eventForms);
        break;
      default:
        return null;
    }

    if (formStructure) {
      return (
        <FormBuilder
          formStructure={formStructure}
          submissionFunction={
            modalType === "action" ? handleAddAction : handleAddEvent
          }
          buttonText={modalType === "action" ? "Add Action" : "Set Event"}
        />
      );
    }

    return null;
  };

  return (
    <>
      {isOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-xl font-bold">Add a new {modalType}</h3>

            <Select
              field={
                {
                  question: `${toTitleCase(modalType)} Type`,
                  type: "select",
                  key: "type",
                  options: options,
                } as FormField
              }
              onChange={(k, v: FieldValue) => {
                setSelectedType(v as string);
              }}
              isMultiSelect={false}
              allowArbitraryInput={false}
            />

            {modalType !== null && renderPipelineEventForm(selectedType)}
            <div className="modal-action">
              <button
                onClick={() => {
                  setSelectedType(undefined);
                  onClose();
                }}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PipelineActionModal;

// Helper functions to create form structures for each action type
const createSendEmailFormStructure = (
  eventForms: FormStructure[] | undefined,
  eventEmailTemplates: EmailTemplate[] | undefined
): FormStructure => {
  return {
    attrs: [
      {
        question: "Name This Action",
        type: "text",
        key: "name",
        required: true,
      },
      {
        question: "Email Template",
        type: "select",
        key: "emailTemplateID",
        required: true,
        options: eventEmailTemplates?.map((template) => {
          return {
            value: template.id,
            label: `${template.name} (${template.id})`,
          } as FormOptionCustomLabelValue;
        }),
      },
      {
        question: "Email Address Field",
        type: "select",
        key: "emailFieldID",
        description: "What field contains the email address?",
        required: true,
        options: eventForms?.flatMap((form) =>
          form.attrs.map((attr) => ({
            value: `${attr.key}`,
            label: `${attr.question} (${form.name} id: ${form.id})`, // TODO: Conditional options depending on form selected.
          }))
        ),
      },
      // Add more fields as needed
    ],
  };
};

const createAllowFormAccessFormStructure = (
  eventForms: FormStructure[] | undefined
): FormStructure => {
  return {
    attrs: [
      {
        question: "Name This Action",
        type: "text",
        key: "name",
        required: true,
      },
      {
        question: "To Form",
        type: "select",
        key: "toFormID",
        required: true,
        options: eventForms?.map((form) => {
          return {
            value: form.id,
            label: `${form.name} (${form.id})`,
          } as FormOptionCustomLabelValue;
        }),
      },
      {
        question: "Expiration (in hours)",
        type: "number",
        key: "expiration",
        additionalValidation: { min: 1 },
      },
      // Add more fields as needed
    ],
  };
};

const createWebhookFormStructure = (
  eventForms: FormStructure[] | undefined
): FormStructure => {
  return {
    attrs: [
      {
        question: "Name This Action",
        type: "text",
        key: "name",
        required: true,
      },
      {
        question: "URL",
        type: "text",
        key: "url",
        required: true,
      },
      {
        question: "Method",
        type: "select",
        key: "method",
        options: ["POST", "GET", "PUT", "DELETE"],
        required: true,
      },
      // Add fields for headers and body as necessary
    ],
  };
};

const createFormSubmissionFormStructure = (
  eventForms: FormStructure[] | undefined
): FormStructure => {
  return {
    attrs: [
      {
        question: "Name This Action",
        type: "text",
        key: "name",
        required: true,
      },
      {
        question: "On Form",
        type: "select",
        key: "onFormID",
        required: true,
        options: eventForms?.map((form) => {
          return {
            value: form.id,
            label: `${form.name} (${form.id})`,
          } as FormOptionCustomLabelValue;
        }),
      },
    ],
  };
};

const createFieldChangeFormStructure = (
  eventForms: FormStructure[] | undefined
): FormStructure => {
  return {
    attrs: [
      {
        question: "Name This Action",
        type: "text",
        key: "name",
        required: true,
      },
      {
        question: "On Form",
        type: "select",
        key: "onFormID",
        required: true,
        options: eventForms?.map((form) => {
          return {
            value: form.id,
            label: `${form.name} (${form.id})`,
          } as FormOptionCustomLabelValue;
        }),
      },
      {
        question: "On Form Field",
        type: "select",
        key: "onFieldID",
        required: true,
        options: eventForms?.flatMap((form) =>
          form.attrs.map((attr) => ({
            value: `${attr.key}`,
            label: `${attr.question} (${form.name} id: ${form.id})`, // TODO: Conditional options depending on form selected.
          }))
        ),
      },
      // TODO: Need to do the condition
    ],
  };
};
