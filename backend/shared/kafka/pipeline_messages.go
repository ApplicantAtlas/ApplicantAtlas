package kafka

import (
	"shared/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// PipelineAction represents a pipeline action
type PipelineActionMessage interface {
	MessageType() string
}

// SendEmailMessage requires either an email field ID or an email address.
// SendEmailMessage represents a send email message
type SendEmailMessage struct {
	PipelineRunID   primitive.ObjectID     `bson:"pipelineRunID" json:"pipelineRunID" validate:"required"`
	Type            string                 `json:"type" bson:"type" validate:"required,eq=SendEmail"`
	EmailTemplateID primitive.ObjectID     `bson:"emailTemplateID" json:"emailTemplateID" validate:"required"`
	EventID         primitive.ObjectID     `bson:"eventID" json:"eventID" validate:"required"`
	Data            map[string]interface{} `bson:"data" json:"data" validate:"required"`
	EmailFieldID    string                 `bson:"emailFieldID" json:"emailFieldID"`
	EmailAddress    string                 `bson:"emailAddress" json:"emailAddress"`
}

func (s SendEmailMessage) MessageType() string {
	return s.Type
}

func NewSendEmailMessage(pipelineRunID primitive.ObjectID, emailTemplate primitive.ObjectID, eventID primitive.ObjectID, data map[string]interface{}, emailFieldID string, emailAddress string) *SendEmailMessage {
	return &SendEmailMessage{
		PipelineRunID:   pipelineRunID,
		Type:            "SendEmail",
		EmailTemplateID: emailTemplate,
		EventID:         eventID,
		Data:            data,
		EmailFieldID:    emailFieldID,
		EmailAddress:    emailAddress,
	}
}

// AllowFormAccessMessage represents an allow form access message
type AllowFormAccessMessage struct {
	PipelineRunID primitive.ObjectID       `bson:"pipelineRunID" json:"pipelineRunID" validate:"required"`
	Type          string                   `json:"type" bson:"type" validate:"required,eq=AllowFormAccess"`
	ToFormID      string                   `bson:"toFormID" json:"toFormID" validate:"required"`
	Options       models.FormAccessOptions `bson:"options" json:"options" validate:"required"`
}

func (s AllowFormAccessMessage) MessageType() string {
	return s.Type
}

func NewAllowFormAccessMessage(pipelineRunID primitive.ObjectID, toFormID string, options models.FormAccessOptions) *AllowFormAccessMessage {
	return &AllowFormAccessMessage{
		PipelineRunID: pipelineRunID,
		Type:          "AllowFormAccess",
		ToFormID:      toFormID,
		Options:       options,
	}
}

// WebhookMessage represents a webhook message
type WebhookMessage struct {
	PipelineRunID primitive.ObjectID     `bson:"pipelineRunID" json:"pipelineRunID" validate:"required"`
	Type          string                 `json:"type" bson:"type" validate:"required,eq=Webhook"`
	Endpoint      string                 `bson:"endpoint" json:"endpoint" validate:"required"`
	Method        string                 `bson:"method" json:"method" validate:"required"`
	Headers       map[string]interface{} `bson:"headers" json:"headers"`
	Body          map[string]interface{} `bson:"body" json:"body"`
}

func (s WebhookMessage) MessageType() string {
	return s.Type
}

func NewWebhookMessage(pipelineRunID primitive.ObjectID, endpoint string, method string, headers map[string]interface{}, body map[string]interface{}) *WebhookMessage {
	return &WebhookMessage{
		PipelineRunID: pipelineRunID,
		Type:          "Webhook",
		Endpoint:      endpoint,
		Method:        method,
		Headers:       headers,
		Body:          body,
	}
}