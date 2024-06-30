package producer

import (
	"errors"
	"shared/config"
)

type MessageProducer interface {
	ProduceMessage(message string) error
	Close() error
}

func NewMessageProducer() (MessageProducer, error) {
	cfg, err := config.GetAPIConfig()
	if err != nil {
		return nil, err
	}

	switch cfg.MESSAGE_BROKER_TYPE {
	case "kafka":
		if cfg.KAFKA_BROKER_URLS == nil || len(cfg.KAFKA_BROKER_URLS) == 0 {
			return nil, errors.New("KAFKA_BROKER_URLS is required for Kafka message broker")
		}
		return NewKafkaProducer(cfg.KAFKA_BROKER_URLS)
	case "sqs":
		if cfg.SQS_AWS_REGION == "" {
			return nil, errors.New("SQS_AWS_REGION is required for SQS message broker")
		}

		if cfg.SQS_QUEUE_URL == "" {
			return nil, errors.New("SQS_QUEUE_URL is required for SQS message broker")
		}

		return NewSQSProducer(cfg.SQS_AWS_REGION, cfg.SQS_QUEUE_URL)
	default:
		return nil, errors.New("invalid message broker type specified")
	}
}
