package consumer

import (
	"errors"
	"shared/config"
)

type MessageConsumer interface {
	ConsumeMessage() (string, error)
}

func NewMessageConsumer() (MessageConsumer, error) {
	cfg, err := config.GetEventListenerConfig()
	if err != nil {
		return nil, err
	}

	switch cfg.MESSAGE_BROKER_TYPE {
	case "kafka":
		if cfg.KAFKA_BROKER_URLS == nil || len(cfg.KAFKA_BROKER_URLS) == 0 {
			return nil, errors.New("KAFKA_BROKER_URLS is required for Kafka message broker")
		}
		return NewKafkaConsumer()
	case "sqs":
		return nil, errors.New("SQS message broker not yet implemented")
	default:
		return nil, errors.New("invalid message broker type specified")
	}
}
