package helpers

import (
	"context"
	"errors"
	"shared/kafka"
	"shared/models"
	"shared/mongodb"
	"time"

	"github.com/IBM/sarama"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TriggerPipeline(c context.Context, producer sarama.SyncProducer, mongo mongodb.MongoService, pipeline models.PipelineConfiguration, actionData map[string]interface{}) error {
	pipelineRun := models.PipelineRun{
		PipelineID:  pipeline.ID,
		TriggeredAt: time.Now(),
		Actions:     []models.PipelineAction{},
		Status:      "pending",
	}

	newPipeline, err := mongo.CreatePipelineRun(c, pipelineRun)
	if err != nil {
		return err
	}
	runID := newPipeline.InsertedID.(primitive.ObjectID)

	// kafka.NewSendEmailMessage("email-action", pipelineRunID, emailTemplateID, eventID, data, emailFieldID, emailAddress)
	for _, action := range pipeline.Actions {
		var actionMessage kafka.PipelineActionMessage
		switch action.ActionType() {
		case "SendEmail":
			// convert to SendEmail
			sendEmail, ok := action.(models.SendEmail)
			if !ok {
				return errors.New("could not convert action to SendEmail")
			}

			actionMessage = kafka.NewSendEmailMessage("email-action", runID, sendEmail.EmailTemplateID, pipeline.EventID, actionData, sendEmail.EmailFieldID)
		default:
			return errors.New("Action type not implemented")
		}

		kafka.WriteActionToKafka(producer, actionMessage)
	}

	return nil
}
