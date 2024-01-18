import FormBuilder from "@/components/Form/FormBuilder";
import { eventEmitter } from "@/events/EventEmitter";
import { createForm } from "@/services/FormService";
import { CreatePipeline } from "@/services/PipelineService";
import { EventModel } from "@/types/models/Event";
import { FormStructure } from "@/types/models/Form";
import { PipelineConfiguration } from "@/types/models/Pipeline";
import { pipeline } from "stream";

interface CreateNewPipelineProps {
    eventDetails: EventModel;
    onSubmit: () => void;
}

const CreateNewPipeline: React.FC<CreateNewPipelineProps> = ({ onSubmit, eventDetails }) => {
    const createNewPipelineStructure: FormStructure = {
        attrs: [
          {
            question: 'Name of Pipeline',
            type: 'text',
            key: 'name',
            required: true,
          },
        ],
      }; 
    
      const handleSubmit = (formData: Record<string, any>) => {
        const { name } = formData;
        const pipelineStructure: PipelineConfiguration = {
            name: name,
            eventID: eventDetails.ID,
            updatedAt: new Date(),
        }
        CreatePipeline(pipelineStructure)
          .then(() => {
            eventEmitter.emit('success', 'Successfully created new pipeline!');
            onSubmit();
          })
          .catch((err) => {
            onSubmit()
          });
      };

      return <FormBuilder formStructure={createNewPipelineStructure} submissionFunction={handleSubmit} buttonText='Create New Pipeline' />
}

export default CreateNewPipeline;