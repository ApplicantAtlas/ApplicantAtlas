import React, { useEffect, useState } from "react";
import { GetPipelineRuns } from "@/services/PipelineService";
import { PipelineRun } from "@/types/models/PipelineRun";
import { ToastType, useToast } from "@/components/Toast/ToastContext";
import { PipelineConfiguration } from "@/types/models/Pipeline";
import StatusIcon from "@/components/Icons/StatusIcon";

interface PipelineRunsProps {
    pipeline: PipelineConfiguration;
}

const statusColors = {
    Pending: "text-yellow-500",
    Running: "text-blue-500",
    Failure: "text-red-500",
    Success: "text-green-500",
};

const PipelineRuns: React.FC<PipelineRunsProps> = ({ pipeline }) => {
    const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
    const { showToast } = useToast();

    const fetchPipelineRuns = async () => {
        GetPipelineRuns(pipeline.id || "")
            .then((response) => {
                setPipelineRuns(response.data.runs);
            })
            .catch(() => {
                showToast("Failed to fetch pipeline runs", ToastType.Error);
            });
    };

    useEffect(() => {
        fetchPipelineRuns();
    }, [pipeline.id]);

    return (
        <div className="p-4">
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Status</th>
                            <th>Triggered At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pipelineRuns.map((run) => (
                            <tr key={run.id} className="hover">
                                <td>{run.id}</td>
                                <td>
                                    <div className="flex items-center space-x-2">
                                        <StatusIcon status={run.status} />
                                        <span className={statusColors[run.status]}>{run.status}</span>
                                    </div>
                                </td>
                                <td>{new Intl.DateTimeFormat("en-us").format(new Date(run.triggeredAt))}</td>
                                <td>
                                    {run.actionStatuses.map((action) => (
                                        <div key={action.actionID} className="flex items-center space-x-2">
                                            <span>{action.actionID}: {action.status}</span>
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PipelineRuns;
