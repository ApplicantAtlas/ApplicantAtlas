import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import FormBuilder from '@/components/Form/FormBuilder';
import {
  FormField,
  FieldValue,
  FormStructure,
  FormOptionCustomLabelValue,
} from '@/types/models/Form';
import { EmailTemplate } from '@/types/models/EmailTemplate';
import { IsObjectIDNotNull } from '@/utils/conversions';
import { getEventForms } from '@/services/EventService';
import { ToastType, useToast } from '@/components/Toast/ToastContext';
import { AppDispatch, RootState } from '@/store';
import { setEmailTemplateState } from '@/store/slices/emailTemplateSlice';
import { UpdateEmailTemplate } from '@/services/EmailTemplateService';

interface EmailTemplateEditorProps {}

const EmailTemplateEditor = ({}: EmailTemplateEditorProps) => {
  const dispatch: AppDispatch = useDispatch();
  const templateData = useSelector(
    (state: RootState) => state.emailTemplate.emailTemplateState,
  );
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );
  const [eventForms, setEventForms] = useState<FormStructure[]>();
  const { showToast } = useToast();

  useMemo(() => {
    if (eventDetails !== null) {
      getEventForms(eventDetails.ID)
        .then((f) => {
          setEventForms(f.data.forms);
        })
        .catch(() => {});
    } else {
      showToast('Could not find event details to load forms', ToastType.Error);
    }
  }, [eventDetails, showToast]);

  // TODO: Pre-populate the templating form ID with the list of all forms
  // TODO: Allow some sort of validation and auto popup for the templating form field IDs
  const formFields: FormField[] = useMemo(() => {
    if (templateData === null) return [];
    return [
      {
        key: 'name',
        question: 'Template Name',
        type: 'text',
        defaultValue: templateData.name,
        required: true,
      },
      {
        key: 'description',
        question: 'Description',
        type: 'textarea',
        defaultValue: templateData.description,
      },
      {
        key: 'from',
        question: 'Email Address To Send From',
        type: 'text',
        defaultValue: templateData.from,
        required: true,
        additionalValidation: {
          isEmail: {
            isEmail: true,
          },
        },
      },
      {
        key: 'subject',
        question: 'Subject',
        type: 'text',
        defaultValue: templateData.subject,
      },
      {
        key: 'body',
        question: 'Email Body',
        type: 'richtext',
        defaultValue: templateData.body,
      },
      {
        key: 'dataFromFormID',
        question: 'Allow Templating From Form ID',
        description:
          "If you want to use data from a form's submission in your email template, enter the form ID here. You can then template with ${field_id}", // TODO: Want to link out to docs about templating on click
        type: 'select',
        defaultOptions: IsObjectIDNotNull(templateData.dataFromFormID)
          ? [templateData.dataFromFormID as string]
          : undefined,
        options: eventForms?.map(
          (form) =>
            ({
              value: form.id,
              label: `${form.name} (${form.id})`,
            }) as FormOptionCustomLabelValue,
        ),
      },
      {
        key: 'cc',
        question: 'CC',
        type: 'custommultiselect',
        defaultOptions: templateData.cc,
      },
      {
        key: 'bcc',
        question: 'BCC',
        type: 'custommultiselect',
        defaultOptions: templateData.bcc,
      },
      {
        key: 'replyTo',
        question: 'Reply To',
        type: 'customselect',
        defaultOptions: templateData.replyTo ? [templateData.replyTo] : [],
        options: templateData.replyTo ? [templateData.replyTo] : [],
      },
    ];
  }, [templateData, eventForms]);

  const handleFormSubmission = (formData: Record<string, FieldValue>) => {
    const updatedTemplate = {
      ...templateData,
      ...formData,
      isHTML: true,
    } as EmailTemplate;
    UpdateEmailTemplate(updatedTemplate)
      .then((r) => {
        const newTemplate = { ...updatedTemplate };
        newTemplate.lastUpdatedAt = r.data.lastUpdatedAt;
        showToast('Email template updated successfully', ToastType.Success);
        dispatch(setEmailTemplateState(newTemplate));
      })
      .catch(() => {});
  };

  if (templateData === null) return <p>Error loading template from state</p>;

  return (
    <div className="form-control w-full max-w-2xl">
      <FormBuilder
        formStructure={{ attrs: formFields }}
        submissionFunction={handleFormSubmission}
        buttonText="Save Changes"
      />
    </div>
  );
};

export default EmailTemplateEditor;
