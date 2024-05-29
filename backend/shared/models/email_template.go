package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type EmailTemplate struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty" mongoPreventOverride:"true"`
	EventID        primitive.ObjectID `bson:"eventID" json:"eventID" validate:"required" mongoPreventOverride:"true"`
	DataFromFormID primitive.ObjectID `bson:"dataFromFormID" json:"dataFromFormID"`
	Name           string             `bson:"name" json:"name" validate:"required"`
	Body           string             `bson:"body" json:"body"`
	Subject        string             `bson:"subject" json:"subject"`
	From           string             `bson:"from" json:"from" validate:"required"`
	CC             []string           `bson:"cc" json:"cc"`
	BCC            []string           `bson:"bcc" json:"bcc"`
	ReplyTo        string             `bson:"replyTo" json:"replyTo"`
	Description    string             `bson:"description" json:"description"`
	IsHTML         bool               `bson:"isHTML" json:"isHTML"`

	LastUpdatedAt time.Time `bson:"lastUpdatedAt" json:"lastUpdatedAt"`
}
