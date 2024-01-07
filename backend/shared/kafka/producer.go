package kafka

import (
	"errors"
	"os"
	"shared/utils"

	"github.com/IBM/sarama"
)

// CreateProducer creates and returns a Kafka producer
func CreateProducer() (sarama.SyncProducer, error) {
	if utils.RunningInAWSLambda() {
		// AWS-specific Kafka producer creation logic
		return createAWSKafkaProducer()
	} else {
		// Local Kafka producer creation logic
		return createLocalKafkaProducer()
	}
}

func createLocalKafkaProducer() (sarama.SyncProducer, error) {
	brokers := []string{os.Getenv("KAFKA_BROKER_URL")} // Example: "localhost:9092"
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	config.Producer.Return.Successes = true

	// Additional configuration based on your requirements

	producer, err := sarama.NewSyncProducer(brokers, config)
	if err != nil {
		return nil, err
	}

	return producer, nil
}

func createAWSKafkaProducer() (sarama.SyncProducer, error) {
	// AWS-specific producer creation logic
	// This might involve configuring the producer to work with MSK
	// and potentially using different authentication mechanisms

	// Example (placeholder):
	// producer, err := sarama.NewSyncProducer(awsBrokers, awsConfig)
	// if err != nil {
	//     return nil, err
	// }

	// return producer, nil
	return nil, errors.New("AWS Kafka producer not implemented")
}
