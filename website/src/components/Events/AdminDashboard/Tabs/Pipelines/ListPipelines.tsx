import { AppDispatch, RootState } from "@/store";
import { setPipelineConfiguration } from "@/store/slices/pipelineSlice";
import { FormStructure } from "@/types/models/Form";
import { PipelineConfiguration } from "@/types/models/Pipeline";
import moment from "moment";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface ListPipelinesProps {
  pipelines: PipelineConfiguration[];
}

const ListPipelines = ({ pipelines }: ListPipelinesProps) => {
  const dispatch: AppDispatch = useDispatch();

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date ? moment(date).format("MMMM Do, YYYY") : "";
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-pin-rows table-pin-cols bg-white">
        <thead>
          <tr>
            <td>Name</td>
            <td>Last Updated At</td>
          </tr>
        </thead>
        <tbody>
          {pipelines.map((pipeline) => {
            return (
              <tr
                key={pipeline.id}
                className="hover cursor-pointer"
                onClick={() => {
                  dispatch(setPipelineConfiguration(pipeline));
                }}
              >
                <td>{pipeline.name}</td>
                <td>{formatDate(pipeline.updatedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListPipelines;
