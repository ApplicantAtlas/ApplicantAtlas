import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { GetPipelines } from "@/services/PipelineService";
import { EventModel } from "@/types/models/Event";
import { PipelineConfiguration } from "@/types/models/Pipeline";
import React, { useEffect, useState } from "react";
import CreateNewPipeline from "./CreateNewPipeline";
import SelectPipeline from "./SelectPipeline";
import ListPipelines from "./ListPipelines";

interface PipelinesProps {
  eventDetails: EventModel | null;
}

const Pipelines: React.FC<PipelinesProps> = ({ eventDetails }) => {
  const [pipelines, setPipelines] = useState<PipelineConfiguration[] | undefined>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineConfiguration | null>(null);

  useEffect(() => {
    if (eventDetails !== null) {
      GetPipelines(eventDetails.ID)
        .then((f) => {
          setPipelines(f.data.pipelines);
        })
        .catch(() => {});
    }
  }, [refresh])

  if (eventDetails === null || pipelines === undefined) {
    return (
      <>
      <p>Loading...</p>
        <LoadingSpinner />
      </>
    );
  }

  // List Forms
  const onNewPipelineCreated = () => {
    setRefresh(true);
    setShowCreateForm(false);
  };

  const NewPipelineButton = (
    <button
      className="btn btn-outline btn-primary mb-4"
      onClick={() => {
        setShowCreateForm(true);
      }}
    >
      Create New Pipeline
    </button>
  );

  if (showCreateForm) {
    return (
      <>
        <CreateNewPipeline
          eventDetails={eventDetails}
          onSubmit={onNewPipelineCreated}
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

  const onDeletedForm = () => {
    setRefresh(true);
    setSelectedPipeline(null);
  }

  if (selectedPipeline !== null) {
    return (
      <>
        <SelectPipeline
          pipeline={selectedPipeline}
          eventDetails={eventDetails}
          onDelete={onDeletedForm}
        />
        <button
          className="btn btn-error mt-4"
          onClick={() => {
            setSelectedPipeline(null);
          }}
        >
          Go Back
        </button>
      </>
    );
  }

  if (pipelines.length === 0) {
    return (
      <>
        <p>This event has no pipelines yet.</p>
        {NewPipelineButton}
      </>
    );
  }

  const selectPipeline = (pipeline: PipelineConfiguration) => {
    setSelectedPipeline(pipeline);
  };

  return (
    <>
      {NewPipelineButton}
      <ListPipelines pipelines={pipelines} selectPipeline={selectPipeline} />
    </>
  );
};

export default Pipelines;
