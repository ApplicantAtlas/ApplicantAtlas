import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { GetEmailTemplates } from "@/services/EmailTemplateService";
import { EventModel } from "@/types/models/Event";
import React, { useEffect, useState } from "react";
import CreateNewEmailTemplate from "./CreateNewEmailTemplate";
import ListEmailTemplates from "./ListEmailTemplates";
import { EmailTemplate } from "@/types/models/EmailTemplate";
import SelectEmailTemplate from "./SelectEmailTemplate";

interface EmailTemplatesProps {
  eventDetails: EventModel | null;
}

const EmailTemplates: React.FC<EmailTemplatesProps> = ({ eventDetails }) => {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[] | undefined>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    if (eventDetails !== null) {
      GetEmailTemplates(eventDetails.ID)
        .then((f) => {
          setEmailTemplates(f.data.email_templates);
        })
        .catch(() => {});
    }
  }, [refresh])

  if (eventDetails === null || emailTemplates === undefined) {
    return (
      <>
      <p>Loading...</p>
        <LoadingSpinner />
      </>
    );
  }

  // List Forms
  const onNewEmailTemplateCreated = () => {
    setRefresh(true);
    setShowCreateForm(false);
  };

  const NewEmailTemplateButton = (
    <button
      className="btn btn-outline btn-primary mb-4"
      onClick={() => {
        setShowCreateForm(true);
      }}
    >
      Create New Template
    </button>
  );

  if (showCreateForm) {
    return (
      <>
        <CreateNewEmailTemplate
          eventDetails={eventDetails}
          onSubmit={onNewEmailTemplateCreated}
        />
        <button
          className="btn btn-error mt-4"
          onClick={() => {
            setShowCreateForm(false);
          }}
        >
          Cancel
        </button>
      </>
    );
  }

  const onDeletedTemplate = () => {
    setRefresh(true);
    setSelectedEmailTemplate(null);
  }

  if (selectedEmailTemplate !== null) {
    return (
      <>
        <SelectEmailTemplate
          template={selectedEmailTemplate}
          onDelete={onDeletedTemplate}
          eventDetails={eventDetails}
        />
        <button
          className="btn btn-error mt-4"
          onClick={() => {
            setSelectedEmailTemplate(null);
          }}
        >
          Go Back
        </button>
      </>
    );
  }

  if (emailTemplates.length === 0) {
    return (
      <>
        <p>This event has no email templates yet.</p>
        {NewEmailTemplateButton}
      </>
    );
  }

  const selectEmailTemplate = (template: EmailTemplate) => {
    setSelectedEmailTemplate(template);
  };

  return (
    <>
      {NewEmailTemplateButton}
      <ListEmailTemplates templates={emailTemplates} selectTemplate={selectEmailTemplate} />
    </>
  );
};

export default EmailTemplates;
