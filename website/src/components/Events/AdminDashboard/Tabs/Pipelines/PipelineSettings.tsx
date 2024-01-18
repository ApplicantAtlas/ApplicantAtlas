import FormBuilder from "@/components/Form/FormBuilder";
import { ToastType, useToast } from "@/components/Toast/ToastContext";
import { DeletePipeline, UpdatePipeline } from "@/services/PipelineService";
import { FormStructure } from "@/types/models/Form";
import { PipelineConfiguration } from "@/types/models/Pipeline";
import { useState } from "react";

interface PipelineSettingsProps {
  pipeline: PipelineConfiguration;
  onDelete: () => void;
  changePipeline: (pipeline: PipelineConfiguration) => void;
}

const PipelineSettings: React.FC<PipelineSettingsProps> = ({ pipeline, onDelete, changePipeline }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { showToast } = useToast();

  const handleDeletePipeline = async (pipelineID: string | undefined) => {
    if (!pipelineID) return;

    DeletePipeline(pipelineID)
      .then(() => {
        showToast("Pipeline deleted successfully", ToastType.Success);
        onDelete();
      })
      .catch(() => {});
  };

  // TODO: Handle when a default value is provided, but we want to clear it to be undefined
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
        question: "Enable Pipeline",
        description: "Enable the pipeline",
        type: "checkbox",
        key: "enabled",
        required: false,
        defaultValue: pipeline.enabled,
      }
    ],
  };

  const handleSubmit = (formData: Record<string, any>) => {
    const {
      name,
      enabled,
    } = formData;
  
    Object.assign(pipeline, {
      name,
      enabled,
    });

    UpdatePipeline(pipeline).then(() => {
        showToast("Successfully updated pipeline!", ToastType.Success);
        changePipeline(pipeline); // idk if needed or not
    }).catch((err) => {});
  };

  return (
    <>
      <FormBuilder formStructure={pipelineSettingstructure} submissionFunction={handleSubmit} buttonText='Save' />

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
