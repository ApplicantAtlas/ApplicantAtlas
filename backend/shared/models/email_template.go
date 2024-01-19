package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type EmailTemplate struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	EventID        primitive.ObjectID `bson:"eventID" json:"eventID" validate:"required"`
	DataFromFormID primitive.ObjectID `bson:"dataFromFormID" json:"dataFromFormID"`
	Name           string             `bson:"name" json:"name" validate:"required"`
	Body           string             `bson:"body" json:"body"`
	Subject        string             `bson:"subject" json:"subject"`
	CC             []string           `bson:"cc" json:"cc"`
	BCC            []string           `bson:"bcc" json:"bcc"`
	ReplyTo        string             `bson:"replyTo" json:"replyTo"`
	LastUpdated    time.Time          `bson:"lastUpdated" json:"lastUpdated"`
	Description    string             `bson:"description" json:"description"`
}
