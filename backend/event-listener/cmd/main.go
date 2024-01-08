package main

import (
	"context"
	"encoding/json"
	"errors"
	"event-listener/internal/handlers"
	"event-listener/internal/types"
	"fmt"
	"log"
	"shared/kafka"
	"shared/utils"

	"github.com/IBM/sarama"
)

var actionHandlers = map[string]types.EventHandler{
	"SendEmail":       handlers.SendEmailHandler{},
	"AllowFormAccess": handlers.AllowFormAccessHandler{},
	"Webhook":         handlers.WebhookHandler{},
}

type consumerGroupHandler struct{}

/*
  TODO: We should consider adding like Metadata to this message that's on the PipelineConfiguration
  like EventID, PipelineID, etc. so that we can track the status of the pipeline and the events.
  We could just consume the entire PipelineConfiguration and then just process the actions in
  order.
  TODO: Lets add logging in a collection like `pipeline_runs` that tracks the status of the pipeline and report any errors
*/

func (h consumerGroupHandler) Setup(_ sarama.ConsumerGroupSession) error {
	fmt.Println("Consumer group started")
	return nil
}
func (h consumerGroupHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }
func (h consumerGroupHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		var actionTypeMap map[string]any
		err := json.Unmarshal(msg.Value, &actionTypeMap)
		if err != nil {
			log.Printf("Error unmarshalling action type: %v", err)
			continue
		}

		actionType, ok := actionTypeMap["type"]
		if !ok {
			log.Println("Message does not contain an action type")
			continue
		}

		actionTypeStr, ok := actionType.(string)
		if !ok {
			log.Println("Action type is not a string")
			return errors.New("action type is not a string")
		}

		if handler, ok := actionHandlers[actionTypeStr]; ok {
			var action kafka.PipelineActionMessage
			switch actionType {
			case "SendEmail":
				action = new(kafka.SendEmailMessage)
			case "AllowFormAccess":
				action = new(kafka.AllowFormAccessMessage)
			case "Webhook":
				action = new(kafka.WebhookMessage)
			default:
				log.Fatalf("No object found for action type: %s", actionType)
			}

			err = json.Unmarshal(msg.Value, &action)
			if err != nil {
				log.Printf("Error unmarshalling %s action: %v", actionType, err)
				continue
			}

			err = handler.HandleAction(action)
			if err != nil {
				log.Printf("Error handling %s action: %v", actionType, err)
				continue
			}
		} else {
			log.Fatalf("No handler found for action type: %s", actionType)
		}

		sess.MarkMessage(msg, "")
	}
	return nil
}

func main() {
	if utils.RunningInAWSLambda() {
		// Lambda start logic if applicable
	} else {
		consumer, err := kafka.CreateConsumer()
		if err != nil {
			log.Fatalf("Failed to create Kafka consumer: %v", err)
		}

		// List of topics to subscribe to
		topics := []string{kafka.PipelineActionTopic}

		handler := consumerGroupHandler{}
		ctx := context.Background()
		for {
			if err := consumer.Consume(ctx, topics, handler); err != nil {
				log.Printf("Error from consumer: %v", err)
			}

			// Check if context was canceled
			if ctx.Err() != nil {
				return
			}
		}
	}
}
