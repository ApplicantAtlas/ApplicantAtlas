import React, { useState } from "react";
import {
  PipelineAction,
} from "@/types/models/Pipeline";
import { FieldValue, FormField, FormStructure } from "@/types/models/Form";
import FormBuilder from "@/components/Form/FormBuilder";
import Select from "@/components/Form/inputs/Select";

interface PipelineActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionSelect: (action: PipelineAction) => void;
}

const PipelineActionModal: React.FC<PipelineActionModalProps> = ({
  isOpen,
  onClose,
  onActionSelect,
}) => {
  const [selectedActionType, setSelectedActionType] =
    useState<string>("SendEmail");

    const createActionObject = (formData: Record<string, any>): PipelineAction | null => {
        switch (selectedActionType) {
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
    if (selectedActionType) {
      const action = createActionObject(formData);
      if (action) {
        onActionSelect(action);
        onClose();
      }
    }
  };

  const renderPipelineEventForm = () => {
    let formStructure: FormStructure | null = null;

    switch (selectedActionType) {
      case "SendEmail":
        formStructure = createSendEmailFormStructure();
        break;
      case "AllowFormAccess":
        formStructure = createAllowFormAccessFormStructure();
        break;
      case "Webhook":
        formStructure = createWebhookFormStructure();
        break;
      default:
        return null;
    }

    if (formStructure) {
      return (
        <FormBuilder
          formStructure={formStructure}
          submissionFunction={handleAddAction}
          buttonText="Add Action"
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
            <h3 className="text-xl font-bold">Add a new action</h3>

            <Select
              field={
                {
                  question: "Action Type",
                  type: "select",
                  key: "actionType",
                  options: ["SendEmail", "AllowFormAccess", "Webhook"],
                } as FormField
              }
              onChange={(k, v: FieldValue) =>
                setSelectedActionType(v as string)
              }
              isMultiSelect={false}
              allowArbitraryInput={false}
              defaultOptions={["SendEmail"]}
            />

            {renderPipelineEventForm()}
            <div className="modal-action">
              <button onClick={onClose} className="btn btn-outline">
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
const createSendEmailFormStructure = (): FormStructure => {
  return {
    attrs: [
      {
        question: "Name This Action",
        type: "text",
        key: "name",
        required: true,
      },
      {
        question: "Email Template ID",
        type: "text",
        key: "emailTemplateID",
        required: true,
      },
      {
        question: "Email Field ID",
        type: "text",
        key: "emailFieldID",
        required: true,
      },
      // Add more fields as needed
    ],
  };
};

const createAllowFormAccessFormStructure = (): FormStructure => {
  return {
    attrs: [
      {
        question: "Name This Action",
        type: "text",
        key: "name",
        required: true,
      },
      {
        question: "To Form ID",
        type: "text",
        key: "toFormID",
        required: true,
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

const createWebhookFormStructure = (): FormStructure => {
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
