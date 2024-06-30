package types

import (
	"shared/kafka/producer"
	"shared/mongodb"
)

type RouteParams struct {
	MongoService    mongodb.MongoService
	MessageProducer producer.MessageProducer
}
