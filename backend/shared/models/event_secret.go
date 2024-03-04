package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type StripableSecret interface {
	StripSecret() interface{}
}

type EventSecrets struct {
	EventID primitive.ObjectID `bson:"eventID" json:"eventID,omitempty"`

	// Embed each specific secret type
	// Each secret type should implement the StripableSecret interface
	// Update the service.go GetEventSecret() method to handle any additional secret types
	Email *EmailSecret `bson:"email" json:"email,omitempty"`
}

type EmailSecret struct {
	SMTPServer string             `bson:"smtpServer" json:"smtpServer,omitempty"`
	Port       int                `bson:"port" json:"port,omitempty"`
	Username   string             `bson:"username" json:"username,omitempty"`
	Password   string             `bson:"password" json:"password,omitempty"`
	UpdatedAt  primitive.DateTime `bson:"updatedAt" json:"updatedAt,omitempty"`
}

func (e *EmailSecret) StripSecret() interface{} {
	return &EmailSecret{
		SMTPServer: "",
		Port:       0,
		Username:   "",
		Password:   "",
		UpdatedAt:  e.UpdatedAt,
	}
}
