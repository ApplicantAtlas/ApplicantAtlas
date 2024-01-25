package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type EventSecretConfiguration struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	EventID primitive.ObjectID `bson:"eventID,omitempty" json:"eventID,omitempty"`
	Secrets []EventSecret      `bson:"secrets,omitempty" json:"secrets,omitempty"`
}

type EventSecret struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Description string             `bson:"description,omitempty" json:"description,omitempty"`
	UpdatedAt   primitive.DateTime `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
	Type        string             `bson:"type,omitempty" json:"type,omitempty"`

	// Embed each specific secret type
	Email *EmailSecret `bson:"email,omitempty" json:"email,omitempty"`
}

type EmailSecret struct {
	SMTPServer string `bson:"smtpServer,omitempty" json:"smtpServer,omitempty"`
	Port       int    `bson:"port,omitempty" json:"port,omitempty"`
	Username   string `bson:"username,omitempty" json:"username,omitempty"`
	Password   string `bson:"password,omitempty" json:"password,omitempty"`
}
