package consumer

import (
	"context"
	"event-listener/internal/helpers"
	"event-listener/internal/types"
	"log"
	"shared/mongodb"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type SQSConsumer struct {
	mongoService   *mongodb.Service
	actionHandlers map[string]types.EventHandler
}

func NewSQSConsumer(mongoService *mongodb.Service, actionHandlers map[string]types.EventHandler) *SQSConsumer {
	return &SQSConsumer{
		mongoService:   mongoService,
		actionHandlers: actionHandlers,
	}
}

func (s *SQSConsumer) Consume(ctx context.Context) error {
	lambda.Start(s.handleSQSEvent)
	return nil
}

func (s *SQSConsumer) handleSQSEvent(ctx context.Context, sqsEvent events.SQSEvent) error {
	for _, message := range sqsEvent.Records {
		success, err := helpers.ProcessMessage([]byte(message.Body), s.mongoService, s.actionHandlers)
		if !success {
			log.Printf("Error processing message: %v", err)
			return err
		}
	}
	return nil
}
