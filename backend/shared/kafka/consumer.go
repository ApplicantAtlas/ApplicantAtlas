package kafka

import (
	"errors"
	"os"
	"shared/utils"

	"github.com/IBM/sarama"
)

// CreateConsumer creates and returns a Kafka consumer
func CreateConsumer() (sarama.ConsumerGroup, error) {
	if utils.RunningInAWSLambda() {
		// AWS-specific Kafka consumer creation logic
		return createAWSKafkaConsumer()
	} else {
		// Local Kafka consumer creation logic
		return createLocalKafkaConsumer()
	}
}

func createLocalKafkaConsumer() (sarama.ConsumerGroup, error) {
	brokers := []string{os.Getenv("KAFKA_BROKER_URL")} // Example: "localhost:9092"
	config := sarama.NewConfig()
	config.Version = sarama.V3_6_0_0 // Specify your Kafka version here
	config.Consumer.Return.Errors = true

	// Additional local configuration setup as needed, like authentication

	group, err := sarama.NewConsumerGroup(brokers, PipelineActionTopicGroup, config)
	if err != nil {
		return nil, err
	}
	return group, nil
}

func createAWSKafkaConsumer() (sarama.ConsumerGroup, error) {
	// AWS-specific consumer creation logic
	// This might involve different configurations or authentication mechanisms for AWS MSK

	// Example (placeholder):
	// group, err := sarama.NewConsumerGroup(awsBrokers, "your-aws-consumer-group-id", awsConfig)
	// if err != nil {
	//     return nil, err
	// }

	// return group, nil
	return nil, errors.New("AWS Kafka consumer not implemented")
}
