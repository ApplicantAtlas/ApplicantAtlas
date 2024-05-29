import { useSelector } from 'react-redux';

import FormBuilder from '@/components/Form/FormBuilder';
import { eventEmitter } from '@/events/EventEmitter';
import { CreatePipeline } from '@/services/PipelineService';
import { RootState } from '@/store';
import { FormStructure } from '@/types/models/Form';
import { PipelineConfiguration } from '@/types/models/Pipeline';

interface CreateNewPipelineProps {
  onSubmit: () => void;
}

const CreateNewPipeline: React.FC<CreateNewPipelineProps> = ({ onSubmit }) => {
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );
  if (eventDetails == null) {
    return <p>Event details not found in state</p>;
  }

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
  const handleSubmit = (formData: Record<string, any>) => {
    const { name } = formData;
    const pipelineStructure: PipelineConfiguration = {
      name: name,
      eventID: eventDetails.ID,
      enabled: false,
    };
    CreatePipeline(pipelineStructure)
      .then(() => {
        eventEmitter.emit('success', 'Successfully created new pipeline!');
        onSubmit();
      })
      .catch((_) => {
        onSubmit();
      });
  };

  return (
    <FormBuilder
      formStructure={createNewPipelineStructure}
      submissionFunction={handleSubmit}
      buttonText="Create New Pipeline"
    />
  );
};

export default CreateNewPipeline;
