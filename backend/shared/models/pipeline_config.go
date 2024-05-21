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
type PipelineEvent struct {
	Type string `bson:"type" json:"type" validate:"required"`
	Name string `bson:"name" json:"name" validate:"required"`

	// Embed each specific event type
	FormSubmission *FormSubmission `bson:"formSubmission,omitempty" json:"formSubmission,omitempty"`
	FieldChange    *FieldChange    `bson:"fieldChange,omitempty" json:"fieldChange,omitempty"`
}

// FormSubmission represents a form submission event
type FormSubmission struct {
	OnFormID primitive.ObjectID `bson:"onFormID" json:"onFormID" validate:"required"`
}

// FieldChange represents a field change event
type FieldChange struct {
	OnFormID  primitive.ObjectID   `bson:"onFormID" json:"onFormID" validate:"required"`
	OnFieldID string               `bson:"onFieldID" json:"onFieldID" validate:"required"`
	Condition FieldChangeCondition `bson:"condition" json:"condition" validate:"required"`
}

// FieldChangeCondition represents the condition for a field change
type FieldChangeCondition struct {
	Comparison Comparison `bson:"comparison" json:"comparison" validate:"required,comparison"`
	Value      string     `bson:"value" json:"value" validate:"required"`
}

//
// Pipeline Actions
//

// PipelineAction represents a pipeline action
type PipelineAction struct {
	Type string             `bson:"type" json:"type" validate:"required,pipelineactiontype"`
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty" mongoPreventOverride:"true"`
	Name string             `bson:"name" json:"name" validate:"required"`

	// Embed each specific action type
	SendEmail       *SendEmail       `bson:"sendEmail,omitempty" json:"sendEmail,omitempty"`
	AllowFormAccess *AllowFormAccess `bson:"allowFormAccess,omitempty" json:"allowFormAccess,omitempty"`
	Webhook         *Webhook         `bson:"webhook,omitempty" json:"webhook,omitempty"`
}

// SendEmail requires either an email field ID or an email address.
// If an email field ID is provided, the email address will be pulled from the data.
// SendEmail represents the action to send an email
type SendEmail struct {
	EmailTemplateID primitive.ObjectID `bson:"emailTemplateID" json:"emailTemplateID" validate:"required"`
	EmailFieldID    string             `bson:"emailFieldID" json:"emailFieldID"`
}

type FormAllowedAccessOptions struct {
	ExpiresInHours int `bson:"expiresInHours" json:"expiresInHours" validate:"required"`
}

// AllowFormAccess represents the action to allow access to a form
type AllowFormAccess struct {
	ToFormID     primitive.ObjectID       `bson:"toFormID" json:"toFormID" validate:"required"`
	Options      FormAllowedAccessOptions `bson:"options" json:"options" validate:"required"`
	EmailFieldID string                   `bson:"emailFieldID" json:"emailFieldID" validate:"required"`
}

// Webhook represents a webhook action
type Webhook struct {
	Type    string            `json:"type" bson:"type" validate:"required,eq=Webhook"`
	URL     string            `bson:"url" json:"url" validate:"required,url"`
	Method  string            `bson:"method" json:"method" validate:"required,oneof=POST GET PUT DELETE"`
	Headers map[string]string `bson:"headers" json:"headers"`
}

//
// Pipeline Configuration
//

// PipelineConfiguration represents the configuration of a pipeline
type PipelineConfiguration struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty" mongoPreventOverride:"true"`
	Name      string             `bson:"name" json:"name" validate:"required"`
	Event     PipelineEvent      `bson:"event,omitempty" json:"event,omitempty" validate:"pipelineevent"`
	Actions   []PipelineAction   `bson:"actions,omitempty" json:"actions,omitempty" validate:"dive"`
	EventID   primitive.ObjectID `bson:"eventID" json:"eventID" validate:"required" mongoPreventOverride:"true"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt" validate:"required"`
	Enabled   bool               `bson:"enabled" json:"enabled" validate:"required"`
}
