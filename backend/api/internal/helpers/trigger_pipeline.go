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
	if !pipeline.Enabled {
		return nil
	}

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

	for _, action := range pipeline.Actions {
		var actionMessage kafka.PipelineActionMessage
		switch action.Type {
		case "SendEmail":
			actionMessage = kafka.NewSendEmailMessage("email-action", runID, action.SendEmail.EmailTemplateID, pipeline.EventID, actionData, action.SendEmail.EmailFieldID)
		default:
			return errors.New("action type not implemented")
		}

		kafka.WriteActionToKafka(producer, actionMessage)
	}

	return nil
}
