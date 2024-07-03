package helpers

import (
	"context"
	"encoding/json"
	"event-listener/internal/types"
	"fmt"
	"log"
	"shared/kafka"
	"shared/models"
	"shared/mongodb"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func ProcessMessage(msgValue []byte, mongoService *mongodb.Service, actionHandlers map[string]types.EventHandler) (success bool, err error) {
	errMsg := func() string {
		var actionTypeMap map[string]any
		err := json.Unmarshal(msgValue, &actionTypeMap)
		if err != nil {
			return fmt.Sprintf("Error unmarshalling action type: %v", err)
		}

		// Get Type
		actionType, ok := actionTypeMap["type"]
		if !ok {
			return "message does not contain an action type"
		}

		actionTypeStr, ok := actionType.(string)
		if !ok {
			return "action type is not a string"
		}

		// Get the pipeline run ID
		pipelineRunIDAny, ok := actionTypeMap["pipelineRunID"]
		if !ok {
			return "message does not contain a pipeline run ID"
		}

		pipelineRunIDStr, ok := pipelineRunIDAny.(string)
		if !ok {
			return "pipeline run ID is not a string"
		}

		pipelineRunID, err := primitive.ObjectIDFromHex(pipelineRunIDStr)
		if err != nil {
			return fmt.Sprintf("Error converting pipeline run ID to ObjectID: %v", err)
		}

		if pipelineRunID.IsZero() {
			return "pipeline run ID is zero"
		}

		// Get the action's ID
		actionIDAny, ok := actionTypeMap["actionID"]
		if !ok {
			return "message does not contain an action ID"
		}

		actionIDStr, ok := actionIDAny.(string)
		if !ok {
			return "action ID is not a string"
		}

		actionID, err := primitive.ObjectIDFromHex(actionIDStr)
		if err != nil {
			return fmt.Sprintf("Error converting action ID to ObjectID: %v", err)
		}

		if actionID.IsZero() {
			return "action ID is zero"
		}

		// Get pipelineID
		pipelineIDAny, ok := actionTypeMap["pipelineID"]
		if !ok {
			return "message does not contain a pipeline ID"
		}

		pipelineIDStr, ok := pipelineIDAny.(string)
		if !ok {
			return "pipeline ID is not a string"
		}

		pipelineID, err := primitive.ObjectIDFromHex(pipelineIDStr)
		if err != nil {
			return fmt.Sprintf("Error converting pipeline ID to ObjectID: %v", err)
		}

		if pipelineID.IsZero() {
			return "pipeline ID is zero"
		}

		// Pipeline Run
		pipelineRun := models.PipelineRun{
			ID:         pipelineRunID,
			PipelineID: pipelineID,
			RanAt:      time.Now(),
			Status:     models.PipelineRunRunning,
		}

		var action kafka.PipelineActionMessage = nil
		var errMsg string = ""
		if handler, ok := actionHandlers[actionTypeStr]; ok {
			errMsg = func(handler types.EventHandler) string {
				switch actionType {
				case "SendEmail":
					action = new(kafka.SendEmailMessage)
				case "AllowFormAccess":
					action = new(kafka.AllowFormAccessMessage)
				case "Webhook":
					action = new(kafka.WebhookMessage)
				default:
					return fmt.Sprintf("No object found for action type: %s\n", actionType)
				}

				err = json.Unmarshal(msgValue, &action)
				if err != nil {
					return fmt.Sprintf("Error unmarshalling %s action: %v\n", actionType, err)
				}

				err = handler.HandleAction(action)
				if err != nil {
					return fmt.Sprintf("Error handling %s action: %v\n", actionType, err)
				}

				return ""
			}(handler)

			if errMsg != "" {
				log.Println(errMsg)
			}
		} else {
			errMsg = fmt.Sprintf("No handler found for action type: %s\n", actionType)
			log.Println(errMsg)
		}

		if errMsg != "" {
			// Mark message as failed
			pipelineRun.Status = models.PipelineRunFailure
		} else {
			// Mark message as successful
			pipelineRun.Status = models.PipelineRunSuccess
		}

		// Mark message as processed
		err = WritePipelineActionMessageProcessed(context.Background(), mongoService, &pipelineRun, actionID, errMsg)
		if err != nil {
			return fmt.Sprintf("Error writing pipeline action message processed: %v", err)
		}
		return ""
	}()

	if errMsg != "" {
		log.Printf("Error processing message: %s", errMsg)
		return false, fmt.Errorf(errMsg)
	} else {
		return true, nil
	}
}
