import FormBuilder from "@/components/Form/FormBuilder";
import { eventEmitter } from "@/events/EventEmitter";
import { CreateEmailTemplate } from "@/services/EmailTemplateService";
import { CreatePipeline } from "@/services/PipelineService";
import { EmailTemplate } from "@/types/models/EmailTemplate";
import { EventModel } from "@/types/models/Event";
import { FormStructure } from "@/types/models/Form";
import { PipelineConfiguration } from "@/types/models/Pipeline";

interface CreateNewEmailTemplateProps {
    eventDetails: EventModel;
    onSubmit: () => void;
}

const CreateNewEmailTemplate: React.FC<CreateNewEmailTemplateProps> = ({ onSubmit, eventDetails }) => {
    const createNewEmailTemplateStructure: FormStructure = {
        attrs: [
          {
            question: 'Name of Email Template',
            type: 'text',
            key: 'name',
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
        }
        CreateEmailTemplate(emailTemplateStructure)
          .then(() => {
            eventEmitter.emit('success', 'Successfully created new email template!');
            onSubmit();
          })
          .catch((err) => {
            onSubmit()
          });
      };

      return <FormBuilder formStructure={createNewEmailTemplateStructure} submissionFunction={handleSubmit} buttonText='Create New Email Template' />
}

export default CreateNewEmailTemplate;