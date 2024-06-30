package main

import (
	"context"
	"encoding/json"
	"event-listener/internal/handlers"
	"event-listener/internal/types"
	"fmt"
	"log"
	"os"
	"shared/config"
	"shared/kafka"
	"shared/models"
	"shared/mongodb"
	"time"

	"github.com/IBM/sarama"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var actionHandlers = map[string]types.EventHandler{}

type consumerGroupHandler struct {
	mongoService *mongodb.Service
}

/*
  TODO: We should consider adding like Metadata to this message that's on the PipelineConfiguration
  like EventID, PipelineID, etc. so that we can track the status of the pipeline and the events.
  We could just consume the entire PipelineConfiguration and then just process the actions in
  order.
  TODO: Lets add logging in a collection like `pipeline_runs` that tracks the status of the pipeline and report any errors

  TODO: Make this more robust
    * retry logic for failed messages

  TODO: refactor
*/

func (h consumerGroupHandler) Setup(_ sarama.ConsumerGroupSession) error {
	fmt.Println("Consumer group started")
	return nil
}
func (h consumerGroupHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }
func (h consumerGroupHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		valid, errMsg := processMessage(msg.Value, h.mongoService)
		if valid {
			sess.MarkMessage(msg, "")
		} else {
			log.Printf("Error processing message: %s", errMsg) // TODO: add logging on entity itself
		}

	}
	return nil
}

func processMessage(msgValue []byte, mongoService *mongodb.Service) (success bool, err error) {
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
		err = writePipelineActionMessageProcessed(context.Background(), mongoService, &pipelineRun, actionID, errMsg)
		if err != nil {
			return fmt.Sprintf("Error writing pipeline action message processed: %v", err)
		}
		return ""
	}()

	if errMsg != "" {
		log.Printf("Error processing message: %s", errMsg)
		return false, fmt.Errorf(errMsg)
	} else {
		log.Printf("Successfully processed message")
		return true, nil
	}
}

// Helper function to manage some of the logic around writing the status of a pipeline action
func writePipelineActionMessageProcessed(ctx context.Context, mongoService *mongodb.Service, pipelineRun *models.PipelineRun, actionID primitive.ObjectID, errMsg string) error {
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

func handleSQSEvent(ctx context.Context, sqsEvent events.SQSEvent) error {
	for _, message := range sqsEvent.Records {
		success, err := processMessage([]byte(message.Body), nil)
		if !success {
			log.Printf("Error processing message: %v", err)
			return err
		}
	}
	return nil
}

func main() {
	// Start mongo
	mongoService, cleanup, err := mongodb.NewService()
	if err != nil {
		log.Fatal(err)
	}

	actionHandlers = map[string]types.EventHandler{
		"SendEmail":       handlers.NewSendEmailHandler(mongoService),
		"AllowFormAccess": handlers.NewAllowFormAccessHandler(mongoService),
		"Webhook":         handlers.NewWebhookHandler(mongoService),
	}

	cfg, err := config.GetEventListenerConfig()
	if err != nil {
		log.Fatalf("Failed to get event listener config: %v", err)
		os.Exit(1)
	}

	switch cfg.MESSAGE_BROKER_TYPE {
	case "kafka":
		consumer, err := kafka.CreateConsumer()
		if err != nil {
			log.Fatalf("Failed to create Kafka consumer: %v", err)
		}

		// List of topics to subscribe to
		topics := []string{kafka.PipelineActionTopic}

		handler := consumerGroupHandler{
			mongoService: mongoService,
		}
		ctx := context.Background()
		for {
			if err := consumer.Consume(ctx, topics, handler); err != nil {
				log.Printf("Error from consumer: %v", err)
			}

			// Check if context was canceled
			if ctx.Err() != nil {
				break
			}
		}
	case "sqs":
		// Lambda start logic for sqs
		lambda.Start(handleSQSEvent)
	}

	// Cleanup Mongo
	cleanup()

}
