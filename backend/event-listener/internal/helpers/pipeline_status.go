package helpers

import (
	"context"
	"shared/models"
	"shared/mongodb"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Helper function to manage some of the logic around writing the status of a pipeline action
func WritePipelineActionMessageProcessed(ctx context.Context, mongoService *mongodb.Service, pipelineRun *models.PipelineRun, actionID primitive.ObjectID, errMsg string) error {
	// Note: this is a pretty messy function
	// Retrieve the pipeline run from the database
	existingPipelineRun, err := mongoService.GetPipelineRun(ctx, bson.M{"_id": pipelineRun.ID})
	if err != nil {
		return err
	}

	isLastActionToComplete := true
	for _, actionStatus := range existingPipelineRun.ActionStatuses {
		if actionStatus.ActionID != actionID {
			if actionStatus.Status != models.PipelineRunSuccess && actionStatus.Status != models.PipelineRunFailure {
				isLastActionToComplete = false
				break
			}
		}
	}

	var newStatus models.PipelineRunStatus
	if isLastActionToComplete {
		newStatus = pipelineRun.Status
	} else {
		newStatus = models.PipelineRunRunning
	}

	// If our status is failure, we know the pipeline has failed and update the status to be that
	if pipelineRun.Status == models.PipelineRunFailure {
		newStatus = models.PipelineRunFailure
	}

	// We need our new Action Statuses to be updated, we only want to update the one where the actionID matches
	// the actionID we are processing
	for i, actionStatus := range existingPipelineRun.ActionStatuses {
		if actionStatus.ActionID == actionID {
			existingPipelineRun.ActionStatuses[i].Status = pipelineRun.Status
			existingPipelineRun.ActionStatuses[i].CompletedAt = time.Now()
			if errMsg != "" {
				existingPipelineRun.ActionStatuses[i].ErrorMsg = errMsg
			}
		}
	}

	updatedPipelineRun := models.PipelineRun{
		ID:          existingPipelineRun.ID,
		PipelineID:  existingPipelineRun.PipelineID,
		TriggeredAt: existingPipelineRun.TriggeredAt,
		RanAt: func() time.Time {
			if existingPipelineRun.RanAt.IsZero() {
				return time.Now()
			}
			return existingPipelineRun.RanAt
		}(),
		CompletedAt:    time.Now(),
		Status:         newStatus,
		ActionStatuses: existingPipelineRun.ActionStatuses,
	}

	// TODO: Fix the race condition on updating the pipeline run.
	_, err = mongoService.UpdatePipelineRun(ctx, updatedPipelineRun, updatedPipelineRun.ID)
	if err != nil {
		return err
	}

	return nil
}
