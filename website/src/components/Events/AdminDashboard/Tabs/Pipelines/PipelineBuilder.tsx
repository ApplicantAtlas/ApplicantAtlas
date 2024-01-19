import React, { useState } from "react";
import PipelineActionModal from "./PipelineActionModal";
import { PipelineAction, PipelineConfiguration, PipelineEvent } from "@/types/models/Pipeline";

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
  const [showModalType, setShowModalType] = useState<"action" | "event" | null>(
    null
  );
  const [deleteAction, setDeleteAction] = useState<PipelineAction>();

  const handleFormSubmit = () => {
    onSubmit(pipelineConfig);
  };

  const handleAddAction = (action: PipelineAction | PipelineEvent) => {
    setPipelineConfig((prevConfig) => ({
      ...prevConfig,
      actions: [...(prevConfig.actions || []), action as PipelineAction],
    }));
  };

  const handleRemoveAction = (action: PipelineAction) => {
    setDeleteAction(undefined);
    setPipelineConfig((prevConfig) => ({
      ...prevConfig,
      actions: prevConfig.actions?.filter((a) => a !== action),
    }));
  };

  const handleSetEvent = (event: PipelineEvent | PipelineAction) => {
    setPipelineConfig((prevConfig) => ({
      ...prevConfig,
      event: event as PipelineEvent,
    }))
  };

  return (
    <>
      <h2 className="text-lg">Pipeline Trigger</h2>

      {pipelineConfig.event && pipelineConfig.event.name && (
        <div className="overflow-x-auto mt-4">
          <table className="table table-pin-rows table-pin-cols bg-white">
            <thead>
              <tr>
                <td>Type</td>
                <td>Details</td>
              </tr>
            </thead>
            <tbody>
              <tr className="hover cursor-pointer">
                <td>{pipelineConfig.event.name}</td>
                <td>{JSON.stringify(pipelineConfig.event, null, 2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {pipelineConfig.event && !pipelineConfig.event.name && (
        <p>No event configured.</p>
      )}

      <p>
        <button
          onClick={() => setShowModalType("event")}
          className="btn btn-primary mt-4"
        >
          {pipelineConfig.event?.name ? "Edit Event" : "Set Event"}
        </button>
      </p>

      <PipelineActionModal
        isOpen={showModalType === "event"}
        onClose={() => setShowModalType(null)}
        onSelect={handleSetEvent}
        modalType="event"
      />

      <h2 className="text-lg mt-4">Pipeline Actions</h2>
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
          onClick={() => setShowModalType("action")}
          className="btn btn-primary mt-4"
        >
          Add Action
        </button>
      </p>

      <p>
        <button
          onClick={handleFormSubmit}
          className="btn btn-primary mt-4"
        >
          Save Pipeline
        </button>
      </p>

      <PipelineActionModal
        isOpen={showModalType === "action"}
        onClose={() => setShowModalType(null)}
        onSelect={handleAddAction}
        modalType="action"
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
