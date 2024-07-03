package consumer

import (
	"context"
	"errors"
	"event-listener/internal/types"
	"shared/config"
	"shared/mongodb"
)

type MessageConsumer interface {
	Consume(ctx context.Context) error
}

func NewMessageConsumer(mongoService *mongodb.Service, actionHandlers map[string]types.EventHandler) (MessageConsumer, error) {
	cfg, err := config.GetEventListenerConfig()
	if err != nil {
		return nil, err
	}

	switch cfg.MESSAGE_BROKER_TYPE {
	case "kafka":
		if cfg.KAFKA_BROKER_URLS == nil || len(cfg.KAFKA_BROKER_URLS) == 0 {
			return nil, errors.New("KAFKA_BROKER_URLS is required for Kafka message broker")
		}
		return NewKafkaConsumer(mongoService, actionHandlers)
	case "sqs":
		return NewSQSConsumer(mongoService, actionHandlers)
	default:
		return nil, errors.New("invalid message broker type specified")
	}
}
