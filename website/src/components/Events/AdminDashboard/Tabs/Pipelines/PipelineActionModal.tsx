import React, { useState } from 'react';

import {
  COMPARISON_VALUES,
  PipelineAction,
  PipelineEvent,
} from '@/types/models/Pipeline';
import {
  FieldValue,
  FormField,
  FormOptionCustomLabelValue,
  FormStructure,
} from '@/types/models/Form';
import FormBuilder from '@/components/Form/FormBuilder';
import Select from '@/components/Form/inputs/Select';
import { toTitleCase } from '@/utils/strings';
import { EmailTemplate } from '@/types/models/EmailTemplate';

interface PipelineActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (action: PipelineAction | PipelineEvent) => void;
  modalType: 'action' | 'event';
  eventForms?: FormStructure[];
  eventEmailTemplates?: EmailTemplate[];
  defaultEvent?: PipelineEvent;
  defaultAction?: PipelineAction;
}

const PipelineActionModal: React.FC<PipelineActionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  modalType,
  eventForms,
  eventEmailTemplates,
  defaultEvent,
  defaultAction,
}) => {
  const options =
    modalType === 'action'
      ? ['SendEmail', 'AllowFormAccess', 'Webhook']
      : ['FormSubmission', 'FieldChange'];
  const defaultType = defaultEvent?.type || defaultAction?.type;
  const [selectedType, setSelectedType] = useState<string | undefined>(
    defaultType,
  );

  const createEventObject = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
    formData: Record<string, any>,
  ): PipelineEvent | null => {
    switch (selectedType) {
      case 'FormSubmission':
        return {
          name: formData.name,
          type: 'FormSubmission',
          formSubmission: {
            onFormID: formData.onFormID,
          },
        };
      case 'FieldChange':
        return {
          name: formData.name,
          type: 'FieldChange',
          fieldChange: {
            onFormID: formData.onFormID,
            onFieldID: formData.onFieldID,
            condition: {
              comparison: formData.comparison,
              value: formData.value,
            },
          },
        };
      default:
        return null;
    }
  };

  const createActionObject = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
    formData: Record<string, any>,
  ): PipelineAction | null => {
    switch (selectedType) {
      case 'SendEmail':
        return {
          name: formData.name,
          type: 'SendEmail',
          sendEmail: {
            emailTemplateID: formData.emailTemplateID,
            emailFieldID: formData.emailFieldID,
          },
        };
      case 'AllowFormAccess':
        return {
          name: formData.name,
          type: 'AllowFormAccess',
          allowFormAccess: {
            toFormID: formData.toFormID,
            options: {
              expiresInHours: formData.expiration,
            },
            emailFieldID: formData.emailFieldID,
          },
        };
      case 'Webhook':
        return {
          name: formData.name,
          type: 'Webhook',
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
  const handleAddAction = (formData: Record<string, any>) => {
    if (selectedType) {
      const action = createActionObject(formData);

      if (action) {
        if (defaultAction) {
          action.id = defaultAction.id; // preserve id
        }

        onSelect(action);
        onClose();
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
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
      case 'SendEmail':
        formStructure = createSendEmailFormStructure(
          eventForms,
          eventEmailTemplates,
          defaultAction,
        );
        break;
      case 'AllowFormAccess':
        formStructure = createAllowFormAccessFormStructure(
          eventForms,
          defaultAction,
        );
        break;
      case 'Webhook':
        formStructure = createWebhookFormStructure(eventForms, defaultAction);
        break;
      case 'FormSubmission':
        formStructure = createFormSubmissionFormStructure(
          eventForms,
          defaultEvent,
        );
        break;
      case 'FieldChange':
        formStructure = createFieldChangeFormStructure(
          eventForms,
          defaultEvent,
        );
        break;
      default:
        return null;
    }

    if (formStructure) {
      return (
        <FormBuilder
          formStructure={formStructure}
          submissionFunction={
            modalType === 'action' ? handleAddAction : handleAddEvent
          }
          buttonText={
            modalType === 'action'
              ? defaultAction
                ? 'Update Action'
                : 'Add Action'
              : 'Set Event'
          }
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
            <h3 className="text-xl font-bold">
              {modalType === 'event'
                ? 'Set pipeline trigger'
                : 'Change or add a new pipeline event'}
            </h3>
            <Select
              field={
                {
                  question: `${toTitleCase(modalType)} Type`,
                  type: 'select',
                  key: 'type',
                  options: options,
                  defaultOptions: defaultType ? [defaultType] : undefined,
                } as FormField
              }
              defaultOptions={selectedType ? [selectedType] : undefined}
              onChange={(k, v: FieldValue) => {
                setSelectedType(v as string);
              }}
              isMultiSelect={false}
              allowArbitraryInput={false}
            />

            {renderPipelineEventForm(selectedType)}
            <div className="modal-action">
              <button
                onClick={() => {
                  setSelectedType(defaultType);
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
  eventEmailTemplates: EmailTemplate[] | undefined,
  defaultAction: PipelineAction | undefined,
): FormStructure => {
  return {
    attrs: [
      {
        question: 'Name This Action',
        type: 'text',
        key: 'name',
        required: true,
        defaultValue: defaultAction?.name,
      },
      {
        question: 'Email Template',
        type: 'select',
        key: 'emailTemplateID',
        required: true,
        options: eventEmailTemplates?.map((template) => {
          return {
            value: template.id,
            label: `${template.name} (${template.id})`,
          } as FormOptionCustomLabelValue;
        }),
        defaultOptions: defaultAction?.sendEmail?.emailTemplateID
          ? [defaultAction?.sendEmail?.emailTemplateID]
          : undefined,
      },
      {
        question: 'Email Address Field',
        type: 'select',
        key: 'emailFieldID',
        description: 'What field contains the email address?',
        required: true,
        options: eventForms?.flatMap((form) =>
          form.attrs.map((attr) => ({
            value: attr.key,
            label: `${attr.question} (${form.name} id: ${form.id})`, // TODO: Conditional options depending on form selected.
          })),
        ),
        defaultOptions: defaultAction?.sendEmail?.emailFieldID
          ? [defaultAction?.sendEmail?.emailFieldID]
          : undefined,
      },
      // Add more fields as needed
    ],
  };
};

const createAllowFormAccessFormStructure = (
  eventForms: FormStructure[] | undefined,
  defaultAction: PipelineAction | undefined,
): FormStructure => {
  return {
    attrs: [
      {
        question: 'Name This Action',
        type: 'text',
        key: 'name',
        required: true,
        defaultValue: defaultAction?.name,
      },
      {
        question: 'To Form',
        type: 'select',
        key: 'toFormID',
        required: true,
        options: eventForms?.map((form) => {
          return {
            value: form.id,
            label: `${form.name} (${form.id})`,
          } as FormOptionCustomLabelValue;
        }),
        defaultOptions: defaultAction?.allowFormAccess?.toFormID
          ? [defaultAction?.allowFormAccess?.toFormID]
          : undefined,
      },
      {
        question: 'Expiration (in hours)',
        description:
          'How long should the form be accessible for? A value of 0 means indefinite access.',
        type: 'number',
        key: 'expiration',
        additionalValidation: { min: 0 },
        defaultValue: defaultAction?.allowFormAccess?.options?.expiresInHours,
      },
      {
        question: 'Email Address Field',
        description:
          'What field contains the email address, that should be granted access to the form?',
        type: 'select',
        key: 'emailFieldID',
        required: true,
        options: eventForms?.flatMap((form) =>
          form.attrs.map((attr) => ({
            value: `${attr.key}`,
            label: `${attr.question} (${form.name} id: ${form.id})`, // TODO: Conditional options depending on form selected.
          })),
        ),
        defaultOptions: defaultAction?.allowFormAccess?.emailFieldID
          ? [defaultAction?.allowFormAccess?.emailFieldID]
          : undefined,
      },
    ],
  };
};

const createWebhookFormStructure = (
  eventForms: FormStructure[] | undefined,
  defaultAction: PipelineAction | undefined,
): FormStructure => {
  return {
    attrs: [
      {
        question: 'Name This Action',
        type: 'text',
        key: 'name',
        required: true,
        defaultValue: defaultAction?.name,
      },
      {
        question: 'URL',
        type: 'text',
        key: 'url',
        required: true,
        defaultValue: defaultAction?.webhook?.url,
      },
      {
        question: 'Method',
        type: 'select',
        key: 'method',
        options: ['POST', 'GET', 'PUT', 'DELETE'],
        required: true,
        defaultOptions: defaultAction?.webhook?.method
          ? [defaultAction?.webhook?.method]
          : undefined,
      },
      // TODO: Add field for headers
    ],
  };
};

const createFormSubmissionFormStructure = (
  eventForms: FormStructure[] | undefined,
  defaultEvent: PipelineEvent | undefined,
): FormStructure => {
  return {
    attrs: [
      {
        question: 'Name This Action',
        type: 'text',
        key: 'name',
        required: true,
        defaultValue: defaultEvent?.name,
      },
      {
        question: 'On Form',
        type: 'select',
        key: 'onFormID',
        required: true,
        options: eventForms?.map((form) => {
          return {
            value: form.id,
            label: `${form.name} (${form.id})`,
          } as FormOptionCustomLabelValue;
        }),
        defaultOptions: defaultEvent?.formSubmission?.onFormID
          ? [defaultEvent?.formSubmission?.onFormID]
          : undefined,
      },
    ],
  };
};

const createFieldChangeFormStructure = (
  eventForms: FormStructure[] | undefined,
  defaultEvent: PipelineEvent | undefined,
): FormStructure => {
  return {
    attrs: [
      {
        question: 'Name This Action',
        type: 'text',
        key: 'name',
        required: true,
        defaultValue: defaultEvent?.name,
      },
      {
        question: 'On Form',
        type: 'select',
        key: 'onFormID',
        required: true,
        options: eventForms?.map((form) => {
          return {
            value: form.id,
            label: `${form.name} (${form.id})`,
          } as FormOptionCustomLabelValue;
        }),
        defaultOptions: defaultEvent?.fieldChange?.onFormID
          ? [defaultEvent?.fieldChange?.onFormID]
          : undefined,
      },
      {
        question: 'On Form Field',
        type: 'select',
        key: 'onFieldID',
        required: true,
        options: eventForms?.flatMap((form) =>
          form.attrs.map((attr) => ({
            value: `${attr.key}`,
            label: `${attr.question} (${form.name} id: ${form.id})`, // TODO: Conditional options depending on form selected.
          })),
        ),
        defaultOptions: defaultEvent?.fieldChange?.onFieldID
          ? [defaultEvent?.fieldChange?.onFieldID]
          : undefined,
      },
      // TODO: Need to do the condition
      {
        question: 'With Condition',
        type: 'select',
        key: 'comparison',
        options: Object.entries(COMPARISON_VALUES).map(([value, label]) => ({
          value,
          label,
        })),
        defaultOptions: defaultEvent?.fieldChange?.condition.comparison
          ? [defaultEvent?.fieldChange?.condition.comparison]
          : undefined,
      },
      {
        question: 'Value',
        type: 'text',
        key: 'value',
        required: true,
        defaultValue: defaultEvent?.fieldChange?.condition.value,
      },
    ],
  };
};
