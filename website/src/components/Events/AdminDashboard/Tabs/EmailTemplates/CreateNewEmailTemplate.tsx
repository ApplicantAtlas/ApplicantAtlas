import FormBuilder from "@/components/Form/FormBuilder";
import { eventEmitter } from "@/events/EventEmitter";
import { CreateEmailTemplate } from "@/services/EmailTemplateService";
import { CreatePipeline } from "@/services/PipelineService";
import { RootState } from "@/store";
import { EmailTemplate } from "@/types/models/EmailTemplate";
import { EventModel } from "@/types/models/Event";
import { FormStructure } from "@/types/models/Form";
import { PipelineConfiguration } from "@/types/models/Pipeline";
import { useSelector } from "react-redux";

interface CreateNewEmailTemplateProps {
  onSubmit: () => void;
}

const CreateNewEmailTemplate: React.FC<CreateNewEmailTemplateProps> = ({
  onSubmit,
}) => {
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails
  );
  if (eventDetails == null) {
    return <p>Event details not found in state</p>;
  }

  const createNewEmailTemplateStructure: FormStructure = {
    attrs: [
      {
        question: "Name of Email Template",
        type: "text",
        key: "name",
        required: true,
      },
    ],
  };

  const handleSubmit = (formData: Record<string, any>) => {
    const { name } = formData;
    const emailTemplateStructure: EmailTemplate = {
      name: name,
      eventID: eventDetails.ID,
      updatedAt: new Date(),
      from: "",
    };
    CreateEmailTemplate(emailTemplateStructure)
      .then(() => {
        eventEmitter.emit(
          "success",
          "Successfully created new email template!"
        );
        onSubmit();
      })
      .catch((err) => {
        onSubmit();
      });
  };

  return (
    <FormBuilder
      formStructure={createNewEmailTemplateStructure}
      submissionFunction={handleSubmit}
      buttonText="Create New Email Template"
    />
  );
};

export default CreateNewEmailTemplate;
