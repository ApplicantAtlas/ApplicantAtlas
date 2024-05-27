import FormBuilder from "@/components/Form/FormBuilder";
import { eventEmitter } from "@/events/EventEmitter";
import { createForm } from "@/services/FormService";
import { CreatePipeline } from "@/services/PipelineService";
import { RootState } from "@/store";
import { EventModel } from "@/types/models/Event";
import { FormStructure } from "@/types/models/Form";
import { PipelineConfiguration } from "@/types/models/Pipeline";
import { useSelector } from "react-redux";
import { pipeline } from "stream";

interface CreateNewPipelineProps {
  onSubmit: () => void;
}

const CreateNewPipeline: React.FC<CreateNewPipelineProps> = ({ onSubmit }) => {
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails
  );
  if (eventDetails == null) {
    return <p>Event details not found in state</p>;
  }

  const createNewPipelineStructure: FormStructure = {
    attrs: [
      {
        question: "Name of Pipeline",
        type: "text",
        key: "name",
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
      enabled: false,
    };
    CreatePipeline(pipelineStructure)
      .then(() => {
        eventEmitter.emit("success", "Successfully created new pipeline!");
        onSubmit();
      })
      .catch((err) => {
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
