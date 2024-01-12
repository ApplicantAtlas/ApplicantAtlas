package types

import (
	"shared/mongodb"

	"github.com/IBM/sarama"
)

type RouteParams struct {
	MongoService  mongodb.MongoService
	KafkaProducer sarama.SyncProducer
}
