export type PipelineRunStatus = "Pending" | "Running" | "Failure" | "Success";

export type PipelineActionStatus = {
    actionID: string;
    status: PipelineRunStatus;
    startedAt?: Date;
    completedAt?: Date;
    errorMsg?: string;
}

export type PipelineRun = {
    id: string;
    pipelineID: string;
    triggeredAt: Date;
    ranAt?: Date;
    completedAt?: Date;
    status: PipelineRunStatus;
    actionStatuses: PipelineActionStatus[];
}