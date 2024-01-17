package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PipelineRun struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	PipelineID  primitive.ObjectID `bson:"pipelineID" json:"pipelineID" validate:"required"`
	TriggeredAt time.Time          `bson:"triggeredAt" json:"triggeredAt" validate:"required"`
	CompletedAt time.Time          `bson:"completedAt" json:"completedAt"`
	Status      string             `bson:"status" json:"status" validate:"required"`
	Actions     []PipelineAction   `bson:"actions" json:"actions" validate:"required"`
}
