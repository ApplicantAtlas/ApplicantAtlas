import { FormStructure } from "@/types/models/Form";
import { PipelineConfiguration } from "@/types/models/Pipeline";
import moment from "moment";
import { useState } from "react";

interface ListPipelinesProps {
  pipelines: PipelineConfiguration[];
  selectPipeline: (form: PipelineConfiguration) => void;
}

const ListPipelines = ({ pipelines, selectPipeline }: ListPipelinesProps) => {
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
                className="hover"
                onClick={() => {
                  selectPipeline(pipeline);
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
