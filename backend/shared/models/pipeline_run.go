package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PipelineRunStatus string

const (
	PipelineRunPending PipelineRunStatus = "Pending"
	PipelineRunRunning PipelineRunStatus = "Running"
	PipelineRunFailure PipelineRunStatus = "Failure"
	PipelineRunSuccess PipelineRunStatus = "Success"
)

type PipelineActionStatus struct {
	ActionID    primitive.ObjectID `bson:"actionID" json:"actionID" validate:"required"`
	Status      PipelineRunStatus  `bson:"status" json:"status" validate:"required"`
	StartedAt   time.Time          `bson:"startedAt" json:"startedAt"`
	CompletedAt time.Time          `bson:"completedAt" json:"completedAt"`
	ErrorMsg    string             `bson:"errorMsg" json:"errorMsg"`
}

type PipelineRun struct {
	ID             primitive.ObjectID     `bson:"_id,omitempty" json:"id,omitempty" mongoPreventOverride:"true"`
	PipelineID     primitive.ObjectID     `bson:"pipelineID" json:"pipelineID" validate:"required"`
	TriggeredAt    time.Time              `bson:"triggeredAt" json:"triggeredAt" validate:"required"`
	RanAt          time.Time              `bson:"ranAt" json:"ranAt"`
	CompletedAt    time.Time              `bson:"completedAt" json:"completedAt"`
	Status         PipelineRunStatus      `bson:"status" json:"status" validate:"required"`
	ActionStatuses []PipelineActionStatus `bson:"actionStatuses" json:"actionStatuses" validate:"required,dive"`
}
