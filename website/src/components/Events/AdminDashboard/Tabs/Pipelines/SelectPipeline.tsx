import { eventEmitter } from "@/events/EventEmitter";
import { useState } from "react";
import { ToastType, useToast } from "@/components/Toast/ToastContext";
import { PipelineAction, PipelineConfiguration } from "@/types/models/Pipeline";
import { UpdatePipeline } from "@/services/PipelineService";
import PipelineSettings from "./PipelineSettings";
import PipelineBuilder from "./PipelineBuilder";
import { EventModel } from "@/types/models/Event";
import PipelineRuns from "./PipelineRuns";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { setPipelineConfiguration } from "@/store/slices/pipelineSlice";

interface SelectPipelineProps {
  onDelete: () => void;
  eventDetails: EventModel;
}

const SelectPipeline: React.FC<SelectPipelineProps> = ({
  onDelete,
  eventDetails
}) => {
  const dispatch: AppDispatch = useDispatch();
  const pipelineConfig = useSelector((state: RootState) => state.pipeline.pipelineState);
  
  const [pageSelected, setPageSelected] = useState<
    "view" | "edit" | "settings" | "runs"
  >("view");

  const { showToast } = useToast();

  // Edit
  const changePipeline = (pipeline: PipelineConfiguration) => {
    dispatch(setPipelineConfiguration(pipeline));
  };

  const updatePipeline = () => {
    if (pipelineConfig === null) {
      showToast("Pipeline not found in state", ToastType.Error);
      return;
    }

    UpdatePipeline(pipelineConfig)
      .then(() => {
        showToast("Successfully updated pipeline!", ToastType.Success);
        changePipeline(pipelineConfig);
      })
      .catch((err) => {});
  };

  const isActive = (page: string) =>
    page === pageSelected ? "btn-active" : "";

  if (pipelineConfig === null) {
    return <p>Loading...</p>;
  }

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
        {pipelineConfig?.name}
      </h2>

      {pageSelected === "edit" && (
        <PipelineBuilder onSubmit={updatePipeline} eventDetails={eventDetails} />
      )}

      {pageSelected === "view" && <p>{JSON.stringify(pipelineConfig)}</p>}

      {pageSelected === "settings" && (
        <PipelineSettings
          onDelete={onDelete}
        />
      )}

      {pageSelected === "runs" && <PipelineRuns />}

      {pageSelected !== "edit" &&
        pageSelected !== "runs" &&
        pageSelected !== "view" &&
        pageSelected !== "settings" && <p>Could not find selected page.</p>}
    </>
  );
};

export default SelectPipeline;
