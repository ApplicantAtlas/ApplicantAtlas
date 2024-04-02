package kafka

import (
	"shared/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// PipelineAction represents a pipeline action
type PipelineActionMessage interface {
	MessageType() string
	GetName() string
}

// SendEmailMessage requires either an email field ID or an email address.
// SendEmailMessage represents a send email message
type SendEmailMessage struct {
	ActionID        primitive.ObjectID     `bson:"actionID" json:"actionID" validate:"required"`
	PipelineID      primitive.ObjectID     `bson:"pipelineID" json:"pipelineID" validate:"required"`
	Name            string                 `bson:"_id,omitempty" json:"_id,omitempty"`
	PipelineRunID   primitive.ObjectID     `bson:"pipelineRunID" json:"pipelineRunID" validate:"required"`
	Type            string                 `json:"type" bson:"type" validate:"required,eq=SendEmail"`
	EmailTemplateID primitive.ObjectID     `bson:"emailTemplateID" json:"emailTemplateID" validate:"required"`
	EventID         primitive.ObjectID     `bson:"eventID" json:"eventID" validate:"required"`
	Data            map[string]interface{} `bson:"data" json:"data" validate:"required"`
	EmailFieldID    string                 `bson:"emailFieldID" json:"emailFieldID"`
}

func (s SendEmailMessage) MessageType() string {
	return s.Type
}

func (s SendEmailMessage) GetName() string {
	return s.Name
}

func NewSendEmailMessage(name string, actionID primitive.ObjectID, pipelineID primitive.ObjectID, pipelineRunID primitive.ObjectID, emailTemplate primitive.ObjectID, eventID primitive.ObjectID, data map[string]interface{}, emailFieldID string) *SendEmailMessage {
	return &SendEmailMessage{
		Name:            name,
		ActionID:        actionID,
		PipelineID:      pipelineID,
		PipelineRunID:   pipelineRunID,
		Type:            "SendEmail",
		EmailTemplateID: emailTemplate,
		EventID:         eventID,
		Data:            data,
		EmailFieldID:    emailFieldID,
	}
}

// AllowFormAccessMessage represents an allow form access message
type AllowFormAccessMessage struct {
	ActionID      primitive.ObjectID              `bson:"actionID" json:"actionID" validate:"required"`
	PipelineID    primitive.ObjectID              `bson:"pipelineID" json:"pipelineID" validate:"required"`
	Name          string                          `bson:"_id,omitempty" json:"_id,omitempty"`
	PipelineRunID primitive.ObjectID              `bson:"pipelineRunID" json:"pipelineRunID" validate:"required"`
	Type          string                          `json:"type" bson:"type" validate:"required,eq=AllowFormAccess"`
	ToFormID      primitive.ObjectID              `bson:"toFormID" json:"toFormID" validate:"required"`
	Options       models.FormAllowedAccessOptions `bson:"formAllowSubmitter" json:"formAllowSubmitter" validate:"required"`
	Data          map[string]interface{}          `bson:"data" json:"data" validate:"required"`
	EmailFieldID  string                          `bson:"emailFieldID" json:"emailFieldID"`
}

func (s AllowFormAccessMessage) MessageType() string {
	return s.Type
}

func (s AllowFormAccessMessage) GetName() string {
	return s.Name
}

func NewAllowFormAccessMessage(name string, actionID primitive.ObjectID, pipelineID primitive.ObjectID, pipelineRunID primitive.ObjectID, toFormID primitive.ObjectID, options models.FormAllowedAccessOptions, data map[string]interface{}, emailFieldID string) *AllowFormAccessMessage {
	return &AllowFormAccessMessage{
		ActionID:      actionID,
		Name:          name,
		PipelineID:    pipelineID,
		PipelineRunID: pipelineRunID,
		Type:          "AllowFormAccess",
		ToFormID:      toFormID,
		Options:       options,
		Data:          data,
		EmailFieldID:  emailFieldID,
	}
}

// WebhookMessage represents a webhook message
type WebhookMessage struct {
	ActionID      primitive.ObjectID     `bson:"actionID" json:"actionID" validate:"required"`
	PipelineID    primitive.ObjectID     `bson:"pipelineID" json:"pipelineID" validate:"required"`
	Name          string                 `bson:"_id,omitempty" json:"_id,omitempty"`
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

func (s WebhookMessage) GetName() string {
	return s.Name
}

func NewWebhookMessage(name string, actionID primitive.ObjectID, pipelineID primitive.ObjectID, pipelineRunID primitive.ObjectID, endpoint string, method string, headers map[string]interface{}, body map[string]interface{}) *WebhookMessage {
	return &WebhookMessage{
		ActionID:      actionID,
		Name:          name,
		PipelineID:    pipelineID,
		PipelineRunID: pipelineRunID,
		Type:          "Webhook",
		Endpoint:      endpoint,
		Method:        method,
		Headers:       headers,
		Body:          body,
	}
}
