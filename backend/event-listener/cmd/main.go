package main

import (
	"context"
	"encoding/json"
	"event-listener/internal/handlers"
	"event-listener/internal/types"
	"fmt"
	"log"
	"shared/kafka"
	"shared/models"
	"shared/utils"

	"github.com/IBM/sarama"
)

var actionHandlers = map[string]types.EventHandler{
	"SendEmail":       handlers.SendEmailHandler{},
	"AllowFormAccess": handlers.AllowFormAccessHandler{},
	"Webhook":         handlers.WebhookHandler{},
}

type consumerGroupHandler struct{}

func (h consumerGroupHandler) Setup(_ sarama.ConsumerGroupSession) error {
	fmt.Println("Consumer group started")
	return nil
}
func (h consumerGroupHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }
func (h consumerGroupHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		var actionTypeMap map[string]string
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

		if handler, ok := actionHandlers[actionType]; ok {
			var action models.PipelineAction
			switch actionType {
			case "SendEmail":
				action = new(models.SendEmail)
			case "AllowFormAccess":
				action = new(models.AllowFormAccess)
			case "Webhook":
				action = new(models.Webhook)
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
