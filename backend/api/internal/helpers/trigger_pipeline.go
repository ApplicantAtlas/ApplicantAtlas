package helpers

import (
	"context"
	"encoding/json"
	"errors"
	"shared/kafka"
	"shared/kafka/producer"
	"shared/models"
	"shared/mongodb"
	"shared/utils"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TriggerPipeline(c context.Context, producer producer.MessageProducer, mongo mongodb.MongoService, pipeline models.PipelineConfiguration, actionData map[string]interface{}) error {
	if !pipeline.Enabled {
		return nil
	}

	// Form an array of PipelineActionStatus for each action in the pipeline
	var actionsStatus []models.PipelineActionStatus
	for _, action := range pipeline.Actions {
		actionsStatus = append(actionsStatus, models.PipelineActionStatus{
			ActionID: action.ID,
			Status:   models.PipelineRunPending,
		})
	}

	pipelineRun := models.PipelineRun{
		PipelineID:     pipeline.ID,
		TriggeredAt:    time.Now(),
		ActionStatuses: actionsStatus,
		Status:         models.PipelineRunPending,
	}

	newPipeline, err := mongo.CreatePipelineRun(c, pipelineRun)
	if err != nil {
		return err
	}
	runID := newPipeline.InsertedID.(primitive.ObjectID)

	for _, action := range pipeline.Actions {
		var actionMessage kafka.PipelineActionMessage
		switch action.Type {
		case "SendEmail":
			actionMessage = kafka.NewSendEmailMessage("email-action", action.ID, pipeline.ID, runID, action.SendEmail.EmailTemplateID, pipeline.EventID, actionData, action.SendEmail.EmailFieldID)
		case "AllowFormAccess":
			actionMessage = kafka.NewAllowFormAccessMessage("allow-form-access-action", action.ID, pipeline.ID, runID, action.AllowFormAccess.ToFormID, action.AllowFormAccess.Options, actionData, action.AllowFormAccess.EmailFieldID)
		case "Webhook":
			actionMessage = kafka.NewWebhookMessage("webhook-action", action.ID, pipeline.ID, runID, action.Webhook.URL, action.Webhook.Method, utils.ConvertMapStringToMapInterface(action.Webhook.Headers), actionData)
		default:
			return errors.New("action type not implemented")
		}

		actionBytes, err := json.Marshal(actionMessage)
		if err != nil {
			return err
		}

		err = producer.ProduceMessage(string(actionBytes))
		if err != nil {
			return err
		}
	}

	return nil
}
