import React, { useMemo, useState } from "react";
import FormBuilder from "@/components/Form/FormBuilder";
import { FormField, FieldValue } from "@/types/models/Form";
import { EmailTemplate } from "@/types/models/EmailTemplate";
import { IsObjectIDNotNull } from "@/utils/conversions";

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  onSubmit: (template: EmailTemplate) => void;
}

const EmailTemplateEditor = ({
  template,
  onSubmit,
}: EmailTemplateEditorProps) => {
  const [templateData, setTemplateData] = useState<EmailTemplate>(template);

  const formFields: FormField[] = useMemo(() => {
    return [
      {
        key: "name",
        question: "Template Name",
        type: "text",
        defaultValue: templateData.name,
        required: true,
      },
      {
        key: "description",
        question: "Description",
        type: "textarea",
        defaultValue: templateData.description,
      },
      {
        key: "subject",
        question: "Subject",
        type: "text",
        defaultValue: templateData.subject,
      },
      {
        key: "body",
        question: "Email Body",
        type: "richtext",
        defaultValue: templateData.body,
      },
      {
        key: "dataFromFormID",
        question: "Allow Templating From Form ID",
        description: "If you want to use data from a form's submission in your email template, enter the form ID here. You can then template with ${field_id}", // TODO: Want to link out to docs about templating on click
        type: "text",
        defaultValue: IsObjectIDNotNull(templateData.dataFromFormID) ? templateData.dataFromFormID : "",
      },
      {
        key: "cc",
        question: "CC",
        type: "custommultiselect",
        defaultValue: templateData.cc,
      },
      {
        key: "bcc",
        question: "BCC",
        type: "custommultiselect",
        defaultValue: templateData.bcc,
      },
      {
        key: "replyTo",
        question: "Reply To",
        type: "customselect",
        defaultValue: templateData.replyTo,
      },
    ];
  }, [templateData]);

  const handleFormSubmission = (formData: Record<string, FieldValue>) => {
    const updatedTemplate = {
      ...templateData,
      ...formData,
      isHTML: true,
    };
    setTemplateData(updatedTemplate);
    onSubmit(updatedTemplate);
  };

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
