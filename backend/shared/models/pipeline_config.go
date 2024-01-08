package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Comparison string

// Enum-like constants for Comparison
const (
	ComparisonEq  Comparison = "eq"
	ComparisonNeq Comparison = "neq"
)

//
// Pipeline Events
//

// PipelineEvent represents a pipeline event
type PipelineEvent interface {
	EventType() string
}

// FormSubmission represents a form submission event
type FormSubmission struct {
	OnFormID string `bson:"onFormID" json:"onFormID" validate:"required"`
}

func (f FormSubmission) EventType() string {
	return "FormSubmission"
}

// FieldChange represents a field change event
type FieldChange struct {
	OnFormID  string               `bson:"onFormID" json:"onFormID" validate:"required"`
	OnFieldID string               `bson:"onFieldID" json:"onFieldID" validate:"required"`
	Condition FieldChangeCondition `bson:"condition" json:"condition" validate:"required"`
}

func (f FieldChange) EventType() string {
	return "FieldChange"
}

//
// Pipeline Actions
//

// PipelineAction represents a pipeline action
type PipelineAction interface {
	ActionType() string
	GetName() string
}

// FieldChangeCondition represents the condition for a field change
type FieldChangeCondition struct {
	Comparison Comparison `bson:"comparison" json:"comparison" validate:"required,comparison"`
	Value      string     `bson:"value" json:"value" validate:"required"`
}

// SendEmail requires either an email field ID or an email address.
// If an email field ID is provided, the email address will be pulled from the data.
// SendEmail represents the action to send an email
type SendEmail struct {
	Name            string             `bson:"name" json:"name" validate:"required"`
	Type            string             `json:"type" bson:"type" validate:"required,eq=SendEmail"`
	EmailTemplateID primitive.ObjectID `bson:"emailTemplateID" json:"emailTemplateID" validate:"required"`
	EmailFieldID    string             `bson:"emailFieldID" json:"emailFieldID"`
	EmailAddress    string             `bson:"emailAddress" json:"emailAddress"`
}

func (s SendEmail) ActionType() string {
	return s.Type
}

func (s SendEmail) GetName() string {
	return s.Name
}

func NewSendEmail(name string, emailTemplate primitive.ObjectID) *SendEmail {
	return &SendEmail{
		Name:            name,
		Type:            "SendEmail",
		EmailTemplateID: emailTemplate,
	}
}

// AllowFormAccess represents the action to allow access to a form
type AllowFormAccess struct {
	Name     string            `bson:"name" json:"name" validate:"required"`
	Type     string            `json:"type" bson:"type" validate:"required,eq=AllowFormAccess"`
	ToFormID string            `bson:"toFormID" json:"toFormID" validate:"required"`
	Options  FormAccessOptions `bson:"options" json:"options" validate:"required"`
}

func (s AllowFormAccess) ActionType() string {
	return s.Type
}

func (s AllowFormAccess) GetName() string {
	return s.Name
}

func NewAllowFormAccess(name string, toFormID string, options FormAccessOptions) *AllowFormAccess {
	return &AllowFormAccess{
		Name:     name,
		Type:     "AllowFormAccess",
		ToFormID: toFormID,
		Options:  options,
	}
}

// FormAccessOptions represents options for form access
type FormAccessOptions struct {
	Expiration ExpirationOptions `bson:"expiration" json:"expiration" validate:"required"`
}

// ExpirationOptions represents expiration options for form access
type ExpirationOptions struct {
	InHoursFromPipelineRun int `bson:"inHoursFromPipelineRun" json:"inHoursFromPipelineRun" validate:"required,gt=0"`
}

// Webhook represents a webhook action
type Webhook struct {
	Name    string            `bson:"name" json:"name" validate:"required"`
	Type    string            `json:"type" bson:"type" validate:"required,eq=Webhook"`
	URL     string            `bson:"url" json:"url" validate:"required,url"`
	Method  string            `bson:"method" json:"method" validate:"required,oneof=POST GET PUT DELETE"`
	Headers map[string]string `bson:"headers" json:"headers"`
	Body    map[string]string `bson:"body" json:"body"`
}

func (s Webhook) ActionType() string {
	return s.Type
}

func (s Webhook) GetName() string {
	return s.Name
}

func NewWebhook(name string, url string, method string, headers map[string]string, body map[string]string) *Webhook {
	return &Webhook{
		Name:    name,
		Type:    "Webhook",
		URL:     url,
		Method:  method,
		Headers: headers,
		Body:    body,
	}
}

//
// Pipeline Configuration
//

// PipelineConfiguration represents the configuration of a pipeline
type PipelineConfiguration struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Event     PipelineEvent      `bson:"event" json:"event" validate:"required,pipelineevent"`
	Actions   []PipelineAction   `bson:"actions" json:"actions" validate:"required,dive,pipelineaction"`
	EventID   string             `bson:"eventID" json:"eventID" validate:"required"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt" validate:"required"`
}
