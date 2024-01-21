import { eventEmitter } from "@/events/EventEmitter";
import { useState } from "react";
import { ToastType, useToast } from "@/components/Toast/ToastContext";
import { PipelineConfiguration } from "@/types/models/Pipeline";
import { UpdatePipeline } from "@/services/PipelineService";
import PipelineSettings from "./PipelineSettings";
import PipelineBuilder from "./PipelineBuilder";
import { EventModel } from "@/types/models/Event";

interface SelectPipelineProps {
  pipeline: PipelineConfiguration;
  onDelete: () => void;
  eventDetails: EventModel;
}

const SelectPipeline: React.FC<SelectPipelineProps> = ({
  pipeline,
  onDelete,
  eventDetails
}) => {
  const [pageSelected, setPageSelected] = useState<
    "view" | "edit" | "settings" | "runs"
  >("view");
  const [pipelineConfig, setPipeline] =
    useState<PipelineConfiguration>(pipeline);
  const { showToast } = useToast();

  // Edit
  const changePipeline = (pipeline: PipelineConfiguration) => {
    setPipeline(pipeline);
  };

  const updatePipeline = (pipeline: PipelineConfiguration) => {
    UpdatePipeline(pipeline)
      .then(() => {
        showToast("Successfully updated pipeline!", ToastType.Success);
        changePipeline(pipeline);
      })
      .catch((err) => {});
  };

  const isActive = (page: string) =>
    page === pageSelected ? "btn-active" : "";

  return (
    <>
      <div className="flex space-x-2 bg-gray-100 p-2 rounded">
        <button
          className={`btn ${isActive("view")}`}
          onClick={() => setPageSelected("view")}
        >
          View
        </button>
        <button
          className={`btn ${isActive("edit")}`}
          onClick={() => setPageSelected("edit")}
        >
          Edit
        </button>
        <button
          className={`btn ${isActive("settings")}`}
          onClick={() => setPageSelected("settings")}
        >
          Settings
        </button>
        <button
          className={`btn ${isActive("runs")}`}
          onClick={() => setPageSelected("runs")}
        >
          Runs
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mt-4 mb-2">
        {pipeline.name}
      </h2>

      {pageSelected === "edit" && (
        <PipelineBuilder pipeline={pipeline} onSubmit={updatePipeline} eventDetails={eventDetails} />
      )}

      {pageSelected === "view" && <p>{JSON.stringify(pipeline)}</p>}

      {pageSelected === "settings" && (
        <PipelineSettings
          pipeline={pipeline}
          onDelete={onDelete}
          changePipeline={changePipeline}
        />
      )}

      {pageSelected === "runs" && <p>Runs</p>}

      {pageSelected !== "edit" &&
        pageSelected !== "runs" &&
        pageSelected !== "view" &&
        pageSelected !== "settings" && <p>Could not find selected page.</p>}
    </>
  );
};

export default SelectPipeline;
