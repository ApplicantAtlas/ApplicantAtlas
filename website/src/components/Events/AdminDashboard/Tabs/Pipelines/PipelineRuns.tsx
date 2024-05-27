import React, { useEffect, useState } from "react";
import { GetPipelineRuns } from "@/services/PipelineService";
import { PipelineRun } from "@/types/models/PipelineRun";
import { ToastType, useToast } from "@/components/Toast/ToastContext";
import { PipelineConfiguration } from "@/types/models/Pipeline";
import StatusIcon from "@/components/Icons/StatusIcon";
import MagnifyingGlassIcon from "@/components/Icons/MagnifyingGlassIcon";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";

interface PipelineRunsProps {}

const statusColors = {
  Pending: "bg-yellow-500",
  Running: "bg-blue-500",
  Failure: "bg-red-500",
  Success: "bg-green-500",
};

const PipelineRuns: React.FC<PipelineRunsProps> = ({ }) => {
  const pipeline = useSelector((state: RootState) => state.pipeline.pipelineState);
  
  if (pipeline === null) {
    return <p>Error selected pipeline null</p>
  }

  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { showToast } = useToast();

  const fetchPipelineRuns = async () => {
    GetPipelineRuns(pipeline.id || "", pageNumber, pageSize)
      .then((response) => {
        setPipelineRuns(response.data.runs);

        // If page and pageSize are different from the response, update them
        if (pageNumber !== response.data.page) {
          setPageNumber(response.data.page);
        }

        if (pageSize !== response.data.pageSize) {
          setPageSize(response.data.pageSize);
        }
      })
      .catch(() => {
        showToast("Failed to fetch pipeline runs", ToastType.Error);
      });
  };

  useEffect(() => {
    fetchPipelineRuns();
  }, [pipeline.id, pageNumber, pageSize]);

  const toggleRow = (id: string) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter((row) => row !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  return (
    <div className="p-4">
      {!pipeline.enabled && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Pipeline is disabled</strong>
          <span className="block sm:inline">
            {" "}
            - Enable the pipeline in settings to resume pipeline runs.
          </span>
        </div>
      )}
      <div className="mx-auto max-w-4x1">
        {pipelineRuns.length > 0 && (
          <table className="table bg-white w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="py-3 px-6">
                  ID
                </th>
                <th scope="col" className="py-3 px-6">
                  Status
                </th>
                <th scope="col" className="py-3 px-6">
                  Triggered At
                </th>
                <th scope="col" className="py-3 px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pipelineRuns.map((run) => (
                  <React.Fragment key={run.id}>
                  <tr
                    key={run.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleRow(run.id)}
                  >
                    <td className="py-4 px-6">{run.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`${
                            statusColors[run.status]
                          } w-8 h-8 rounded-full flex justify-center items-center`}
                        >
                          <StatusIcon
                            status={run.status}
                            className="text-white"
                          />
                        </div>
                        <span>{run.status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }).format(new Date(run.triggeredAt))}
                    </td>
                    <td className="py-4 px-6">
                      {run.actionStatuses.length} Actions
                    </td>
                  </tr>
                  {expandedRows.includes(run.id) && (
                    <tr className="bg-gray-50">
                      <td className="py-4 px-6" colSpan={4}>
                        <div className="flex flex-col space-y-4">
                          {run.actionStatuses.map((action) => (
                            <div
                              key={action.actionID}
                              className="bg-white p-4 shadow rounded-lg"
                            >
                              <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`${
                                      statusColors[run.status]
                                    } w-8 h-8 rounded-full flex justify-center items-center`}
                                  >
                                    <StatusIcon
                                      status={run.status}
                                      className="text-white"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold">Action:</span>
                                  <span className="text-gray-600">
                                    {pipeline.actions?.find(
                                      (action_local) =>
                                        action_local.id === action.actionID
                                    )?.name || "Name not found"}{" "}
                                    ({action.actionID})
                                  </span>
                                </div>
                              </div>
                              {/* Error message on a new row below all other information */}
                              {action.errorMsg && (
                                <div className="mt-2 text-red-500">
                                  <span className="font-medium">
                                    Error Message:
                                  </span>
                                  <code className="ml-2 text-sm bg-gray-100 rounded p-1">
                                    {action.errorMsg}
                                  </code>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}

        {pipelineRuns.length === 0 && (
          <div className="flex flex-col justify-center items-center h-48 bg-white shadow-lg rounded-lg p-6">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-800" />
            <span className="text-lg font-medium text-gray-800 mt-4">
              No pipeline runs found
              {pageNumber == 1 ? <>.</> : <> for this page.</>}
            </span>
            {pageNumber != 1 && (
              <small className="text-gray-500">
                Try changing the page number.
              </small>
            )}
          </div>
        )}

        <div className="join flex justify-center mt-4 ">
          <button
            className="btn join-item bg-white"
            onClick={() => {
              setPageNumber(pageNumber > 1 ? pageNumber - 1 : pageNumber);
            }}
          >
            «
          </button>
          <button className="btn join-item bg-white">Page {pageNumber}</button>
          <button
            className="btn join-item bg-white"
            onClick={() => {
              setPageNumber(pageNumber + 1);
            }}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default PipelineRuns;
