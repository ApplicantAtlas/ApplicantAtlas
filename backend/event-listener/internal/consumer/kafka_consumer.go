// consumer/kafka_consumer.go
package consumer

import (
	"context"
	"event-listener/internal/helpers"
	"event-listener/internal/types"
	"log"
	"shared/config"
	"shared/kafka"
	"shared/logger"
	"shared/mongodb"

	"github.com/IBM/sarama"
)

type KafkaConsumer struct {
	group          sarama.ConsumerGroup
	topic          string
	mongoService   *mongodb.Service
	actionHandlers map[string]types.EventHandler
}

func NewKafkaConsumer(mongoService *mongodb.Service, actionHandlers map[string]types.EventHandler) (*KafkaConsumer, error) {
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

	return &KafkaConsumer{group: group, topic: kafka.PipelineActionTopic, mongoService: mongoService, actionHandlers: actionHandlers}, nil
}

func (k *KafkaConsumer) Consume(ctx context.Context) error {
	handler := &consumerGroupHandler{mongoService: k.mongoService, actionHandlers: k.actionHandlers}
	for {
		if err := k.group.Consume(ctx, []string{k.topic}, handler); err != nil {
			log.Printf("Error from consumer: %v", err)
		}

		if ctx.Err() != nil {
			break
		}
	}
	return nil
}

type consumerGroupHandler struct {
	mongoService   *mongodb.Service
	actionHandlers map[string]types.EventHandler
}

func (h consumerGroupHandler) Setup(_ sarama.ConsumerGroupSession) error   { return nil }
func (h consumerGroupHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }
func (h consumerGroupHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		valid, errMsg := helpers.ProcessMessage(msg.Value, h.mongoService, h.actionHandlers)
		if valid {
			sess.MarkMessage(msg, "")
		} else {
			logger.Error("Error processing message: %v", errMsg)
		}
	}
	return nil
}
