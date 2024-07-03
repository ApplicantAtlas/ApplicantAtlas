package producer

import (
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
)

type SQSProducer struct {
	client   *sqs.SQS
	queueURL string
}

func NewSQSProducer(region string, queueURL string) (*SQSProducer, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region),
	})
	if err != nil {
		return nil, err
	}

	client := sqs.New(sess)
	return &SQSProducer{client: client, queueURL: queueURL}, nil
}

func (s *SQSProducer) ProduceMessage(message string) error {
	fmt.Printf("Producing message to SQS: %s\n", message)
	_, err := s.client.SendMessage(&sqs.SendMessageInput{
		MessageBody: aws.String(message),
		QueueUrl:    aws.String(s.queueURL),
	})
	if err != nil {
		return err
	}
	log.Printf("Produced message to SQS: %s", message)
	return nil
}

func (s *SQSProducer) GetType() string {
	return "sqs"
}

func (s *SQSProducer) Close() error {
	return nil
}
