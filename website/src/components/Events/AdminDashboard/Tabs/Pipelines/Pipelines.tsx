import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { GetPipelines } from '@/services/PipelineService';
import { EventModel } from '@/types/models/Event';
import { PipelineConfiguration } from '@/types/models/Pipeline';
import { AppDispatch, RootState } from '@/store';
import {
  resetPipelineState,
  setPipelineConfiguration,
} from '@/store/slices/pipelineSlice';

import CreateNewPipeline from './CreateNewPipeline';
import SelectPipeline from './SelectPipeline';
import ListPipelines from './ListPipelines';

interface PipelinesProps {}

const Pipelines: React.FC<PipelinesProps> = ({}) => {
  const dispatch: AppDispatch = useDispatch();
  const selectedPipeline = useSelector(
    (state: RootState) => state.pipeline.pipelineState
  );
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails
  );

  const [pipelines, setPipelines] = useState<
    PipelineConfiguration[] | undefined
  >();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (eventDetails !== null) {
      GetPipelines(eventDetails.ID)
        .then((f) => {
          setPipelines(f.data.pipelines);
        })
        .catch(() => {});
    }
  }, [refresh]);

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
        <CreateNewPipeline onSubmit={onNewPipelineCreated} />
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
    dispatch(resetPipelineState());
  };

  if (selectedPipeline !== null) {
    return (
      <>
        <SelectPipeline onDelete={onDeletedForm} />
        <button
          className="btn btn-error mt-4"
          onClick={() => {
            dispatch(resetPipelineState());
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

  return (
    <>
      {NewPipelineButton}
      <ListPipelines pipelines={pipelines} />
    </>
  );
};

export default Pipelines;
