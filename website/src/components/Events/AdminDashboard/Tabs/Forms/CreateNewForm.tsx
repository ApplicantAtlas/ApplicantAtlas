import FormBuilder from "@/components/Form/FormBuilder";
import { eventEmitter } from "@/events/EventEmitter";
import { createForm } from "@/services/FormService";
import { EventModel } from "@/types/models/Event";
import { FormStructure } from "@/types/models/Form";

interface CreateNewFormProps {
    eventDetails: EventModel;
    onSubmit: () => void;
}

const CreateNewForm: React.FC<CreateNewFormProps> = ({ onSubmit, eventDetails }) => {
    const createNewFormStructure: FormStructure = {
        attrs: [
          {
            question: 'Name of Form',
            type: 'text',
            key: 'name',
            required: true,
          },
        ],
      }; 
    
      const handleSubmit = (formData: Record<string, any>) => {
        const { name } = formData;
        const formStructure: FormStructure = {
            attrs: [],
            name: name,
            eventID: eventDetails.ID,
        }
        createForm(formStructure)
          .then(() => {
            eventEmitter.emit('success', 'Successfully created new form!');
            onSubmit();
          })
          .catch((err) => {
            onSubmit()
          });
      };

      return <FormBuilder formStructure={createNewFormStructure} submissionFunction={handleSubmit} buttonText='Create New Event' />
}

export default CreateNewForm;