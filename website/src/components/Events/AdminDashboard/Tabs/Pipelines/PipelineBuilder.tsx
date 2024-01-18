import React, { useState } from "react";
import FormBuilder from "@/components/Form/FormBuilder";
import PipelineActionModal from "./PipelineActionModal";
import {
  AllowFormAccess,
  PipelineAction,
  PipelineConfiguration,
  SendEmail,
  Webhook,
} from "@/types/models/Pipeline";
import { FormStructure } from "@/types/models/Form";

interface PipelineBuilderProps {
  pipeline: PipelineConfiguration;
  onSubmit: (pipeline: PipelineConfiguration) => void;
}

const PipelineBuilder: React.FC<PipelineBuilderProps> = ({
  pipeline,
  onSubmit,
}) => {
  const [pipelineConfig, setPipelineConfig] =
    useState<PipelineConfiguration>(pipeline);
  const [showActionModal, setShowActionModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState<PipelineAction>();

  const pipelineFormStructure: FormStructure = {
    attrs: [
      {
        question: "Pipeline Name",
        type: "text",
        key: "name",
        required: true,
        defaultValue: pipeline.name || "",
      },
      {
        question: "Event Configuration (JSON)",
        type: "textarea",
        key: "event",
        defaultValue: JSON.stringify(pipeline.event || {}, null, 2),
      },
    ],
  };

  const handleFormSubmit = (formData: Record<string, any>) => {
    const updatedPipeline: PipelineConfiguration = {
        ...pipelineConfig,
        name: formData.name,
        event: JSON.parse(formData.event),
        actions: pipelineConfig.actions,
    };
    onSubmit(updatedPipeline);
  };

  const handleAddAction = (action: PipelineAction) => {
    setPipelineConfig((prevConfig) => ({
      ...prevConfig,
      actions: [...(prevConfig.actions || []), action],
    }));
  };

  const handleRemoveAction = (action: PipelineAction) => {
    setDeleteAction(undefined);
    setPipelineConfig((prevConfig) => ({
      ...prevConfig,
      actions: prevConfig.actions?.filter((a) => a !== action),
    }));
  };

  return (
    <>
      <FormBuilder
        formStructure={pipelineFormStructure}
        submissionFunction={handleFormSubmit}
        buttonText="Update Pipeline"
      />

      {pipelineConfig &&
        pipelineConfig.actions &&
        pipelineConfig.actions.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="table table-pin-rows table-pin-cols bg-white">
              <thead>
                <tr>
                  <td>Type</td>
                  <td>Details</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {pipelineConfig.actions?.map((action, index) => {
                  return (
                    <tr key={index} className="hover cursor-pointer">
                      <td>{action.type}</td>
                      <td>{JSON.stringify(action, null, 2)}</td>
                      <td>
                        <button
                          className="btn btn-error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteAction(action);
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      <p>
        <button
          onClick={() => setShowActionModal(true)}
          className="btn btn-primary mt-4"
        >
          Add Action
        </button>
      </p>

      <PipelineActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        onActionSelect={handleAddAction}
      />

      {deleteAction && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Are you sure you want to delete this action?
            </h3>
            <p className="lext-lg mb-2 mt-1">Type: {deleteAction.type}</p>
            <p>{JSON.stringify(deleteAction, null, 2)}</p>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={() => handleRemoveAction(deleteAction)}
              >
                Delete
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteAction(undefined)}
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

export default PipelineBuilder;
