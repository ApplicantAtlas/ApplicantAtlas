import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import FormBuilder from '@/components/Form/FormBuilder';
import { ToastType, useToast } from '@/components/Toast/ToastContext';
import { DeletePipeline, UpdatePipeline } from '@/services/PipelineService';
import { AppDispatch, RootState } from '@/store';
import {
  setPipelineConfiguration,
  updatePipelineConfiguration,
} from '@/store/slices/pipelineSlice';
import { FormStructure } from '@/types/models/Form';

interface PipelineSettingsProps {
  onDelete: () => void;
}

const PipelineSettings: React.FC<PipelineSettingsProps> = ({ onDelete }) => {
  const dispatch: AppDispatch = useDispatch();
  const pipeline = useSelector(
    (state: RootState) => state.pipeline.pipelineState,
  );

  if (pipeline === null) {
    return <p>Error selected pipeline null</p>;
  }

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { showToast } = useToast();

  const handleDeletePipeline = async (pipelineID: string | undefined) => {
    if (!pipelineID) return;

    DeletePipeline(pipelineID)
      .then(() => {
        showToast('Pipeline deleted successfully', ToastType.Success);
        onDelete();
      })
      .catch(() => {});
  };

  const pipelineSettingstructure: FormStructure = {
    attrs: [
      {
        question: 'Pipeline Name',
        description: 'The name of the pipeline',
        type: 'text',
        key: 'name',
        required: true,
        defaultValue: pipeline.name,
      },
      {
        question: 'Enable Pipeline',
        description: 'Enable the pipeline',
        type: 'checkbox',
        key: 'enabled',
        required: false,
        defaultValue: pipeline.enabled,
      },
    ],
  };

  const handleSubmit = (formData: Record<string, any>) => {
    const { name, enabled } = formData;

    dispatch(updatePipelineConfiguration({ name, enabled }));

    if (pipeline) {
      const updatedPipeline = { ...pipeline, name, enabled };

      UpdatePipeline(updatedPipeline)
        .then(() => {
          showToast('Successfully updated pipeline!', ToastType.Success);
          dispatch(setPipelineConfiguration(updatedPipeline));
        })
        .catch((_) => {});
    }
  };

  return (
    <>
      <FormBuilder
        formStructure={pipelineSettingstructure}
        submissionFunction={handleSubmit}
        buttonText="Save"
      />

      <p>
        <button
          className="btn btn-outline btn-error mt-2"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          Delete Pipeline
        </button>
      </p>

      {showDeleteConfirmation && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Are you sure you want to delete this pipeline?
              <br />
              Name: {pipeline.name}
            </h3>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={() => handleDeletePipeline(pipeline.id)}
              >
                Delete
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PipelineSettings;
