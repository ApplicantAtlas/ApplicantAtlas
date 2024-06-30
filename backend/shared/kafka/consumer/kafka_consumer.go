package consumer

import (
	"context"
	"log"
	"shared/config"
	"shared/kafka"

	"github.com/IBM/sarama"
)

type KafkaConsumer struct {
	group sarama.ConsumerGroup
	topic string
}

func NewKafkaConsumer() (*KafkaConsumer, error) {
	eventListenerCfg, err := config.GetEventListenerConfig()
	if err != nil {
		return nil, err
	}

	config := sarama.NewConfig()
	config.Version = sarama.V3_6_0_0
	config.Consumer.Return.Errors = true

	group, err := sarama.NewConsumerGroup(eventListenerCfg.KAFKA_BROKER_URLS, kafka.PipelineActionTopicGroup, config)
	if err != nil {
		return nil, err
	}

	return &KafkaConsumer{group: group, topic: kafka.PipelineActionTopic}, nil
}

func (k *KafkaConsumer) ConsumeMessage() (string, error) {
	ctx := context.Background()
	handler := &consumerGroupHandler{}
	err := k.group.Consume(ctx, []string{k.topic}, handler)
	if err != nil {
		return "", err
	}
	return handler.message, nil
}

type consumerGroupHandler struct {
	message string
}

func (h *consumerGroupHandler) Setup(_ sarama.ConsumerGroupSession) error   { return nil }
func (h *consumerGroupHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }
func (h *consumerGroupHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		log.Printf("Message claimed: value = %s, timestamp = %v, topic = %s", string(msg.Value), msg.Timestamp, msg.Topic)
		h.message = string(msg.Value)
		sess.MarkMessage(msg, "")
		break // Consume one message and break
	}
	return nil
}
