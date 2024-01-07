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
}

// FieldChangeCondition represents the condition for a field change
type FieldChangeCondition struct {
	Comparison Comparison `bson:"comparison" json:"comparison" validate:"required,comparison"`
	Value      string     `bson:"value" json:"value" validate:"required"`
}

// SendEmail represents the action to send an email
type SendEmail struct {
	Type            string             `json:"type"`
	EmailTemplateID primitive.ObjectID `bson:"emailTemplateID" json:"emailTemplateID" validate:"required"`
}

func (f SendEmail) ActionType() string {
	f.Type = "SendEmail"
	return f.Type
}

// AllowFormAccess represents the action to allow access to a form
type AllowFormAccess struct {
	Type     string            `json:"type"`
	ToFormID string            `bson:"toFormID" json:"toFormID" validate:"required"`
	Options  FormAccessOptions `bson:"options" json:"options" validate:"required"`
}

func (f AllowFormAccess) ActionType() string {
	f.Type = "AllowFormAccess"
	return f.Type
}

// FormAccessOptions represents options for form access
type FormAccessOptions struct {
	Expiration ExpirationOptions `bson:"expiration" json:"expiration" validate:"required"`
}

// ExpirationOptions represents expiration options for form access
type ExpirationOptions struct {
	InHoursFromPipelineRun int             `bson:"inHoursFromPipelineRun" json:"inHoursFromPipelineRun" validate:"required,gt=0"`
	Reminder               ReminderOptions `bson:"reminder" json:"reminder" validate:"required"`
}

// ReminderOptions represents reminder options for form expiration
type ReminderOptions struct {
	Remind                  bool `bson:"remind" json:"remind"`
	InHoursBeforeExpiration int  `bson:"inHoursBeforeExpiration" json:"inHoursBeforeExpiration" validate:"gte=0"`
}

// Webhook represents a webhook action
type Webhook struct {
	Type    string            `json:"type"`
	URL     string            `bson:"url" json:"url" validate:"required,url"`
	Method  string            `bson:"method" json:"method" validate:"required,oneof=POST GET PUT DELETE"`
	Headers map[string]string `bson:"headers" json:"headers"`
	Body    map[string]string `bson:"body" json:"body"`
}

func (f Webhook) ActionType() string {
	f.Type = "Webhook"
	return f.Type
}

//
// Pipeline Configuration
//

// PipelineConfiguration represents the configuration of a pipeline
type PipelineConfiguration struct {
	Event     PipelineEvent    `bson:"event" json:"event" validate:"required,pipelineevent"`
	Actions   []PipelineAction `bson:"actions" json:"actions" validate:"required,dive,pipelineaction"`
	EventID   string           `bson:"eventID" json:"eventID" validate:"required"`
	UpdatedAt time.Time        `bson:"updatedAt" json:"updatedAt" validate:"required"`
}
