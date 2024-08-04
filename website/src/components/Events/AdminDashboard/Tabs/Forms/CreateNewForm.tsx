import { useSelector } from 'react-redux';

import FormBuilder from '@/components/Form/FormBuilder';
import { eventEmitter } from '@/events/EventEmitter';
import { createForm } from '@/services/FormService';
import { RootState } from '@/store';
import { FormStructure } from '@/types/models/Form';

interface CreateNewFormProps {
  onSubmit: () => void;
}

const CreateNewForm: React.FC<CreateNewFormProps> = ({ onSubmit }) => {
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );
  if (eventDetails == null) {
    return <p>Event details not found in state</p>;
  }

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
  const handleSubmit = (formData: Record<string, any>) => {
    const { name } = formData;
    const formStructure: FormStructure = {
      attrs: [],
      name: name,
      eventID: eventDetails.ID,
    };
    createForm(formStructure)
      .then(() => {
        eventEmitter.emit('success', 'Successfully created new form!');
        onSubmit();
      })
      .catch((_) => {
        onSubmit();
      });
  };

  return (
    <FormBuilder
      formStructure={createNewFormStructure}
      submissionFunction={handleSubmit}
      buttonText="Create New Form"
    />
  );
};

export default CreateNewForm;
