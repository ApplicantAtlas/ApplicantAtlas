package producer

import (
	"log"
	"shared/kafka"

	"github.com/IBM/sarama"
)

type KafkaProducer struct {
	producer sarama.SyncProducer
}

func NewKafkaProducer(brokers []string) (*KafkaProducer, error) {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	config.Producer.Return.Successes = true

	producer, err := sarama.NewSyncProducer(brokers, config)
	if err != nil {
		return nil, err
	}

	return &KafkaProducer{producer: producer}, nil
}

func (k *KafkaProducer) ProduceMessage(message string) error {
	msg := &sarama.ProducerMessage{
		Topic: kafka.PipelineActionTopic,
		Value: sarama.ByteEncoder(message),
	}

	_, _, err := k.producer.SendMessage(msg)
	if err != nil {
		return err
	}
	log.Printf("Produced message to Kafka: %s", message)
	return nil
}

func (k *KafkaProducer) Close() error {
	return k.producer.Close()
}
