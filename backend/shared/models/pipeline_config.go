package models

import (
	"encoding/json"
	"fmt"
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
	UnmarshalJSON(data []byte) error
}

// FormSubmission represents a form submission event
type FormSubmission struct {
	Type     string `json:"type" bson:"type" validate:"required,eq=FormSubmission"`
	OnFormID string `bson:"onFormID" json:"onFormID" validate:"required"`
}

func (f FormSubmission) EventType() string {
	return f.Type
}

func (f *FormSubmission) UnmarshalJSON(data []byte) error {
	type Alias FormSubmission
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(f),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	f.Type = "FormSubmission"
	return nil
}

// FieldChange represents a field change event
type FieldChange struct {
	Type      string               `json:"type" bson:"type" validate:"required,eq=FieldChange"`
	OnFormID  string               `bson:"onFormID" json:"onFormID" validate:"required"`
	OnFieldID string               `bson:"onFieldID" json:"onFieldID" validate:"required"`
	Condition FieldChangeCondition `bson:"condition" json:"condition" validate:"required"`
}

func (f FieldChange) EventType() string {
	return f.Type
}

func (f *FieldChange) UnmarshalJSON(data []byte) error {
	type Alias FieldChange
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(f),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	f.Type = "FieldChange"
	return nil
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
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name            string             `bson:"name" json:"name" validate:"required"`
	Type            string             `json:"type" bson:"type" validate:"required,eq=SendEmail"`
	EmailTemplateID primitive.ObjectID `bson:"emailTemplateID" json:"emailTemplateID" validate:"required"`
	EmailFieldID    string             `bson:"emailFieldID" json:"emailFieldID"`
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
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name     string             `bson:"name" json:"name" validate:"required"`
	Type     string             `json:"type" bson:"type" validate:"required,eq=AllowFormAccess"`
	ToFormID string             `bson:"toFormID" json:"toFormID" validate:"required"`
	Options  FormAccessOptions  `bson:"options" json:"options" validate:"required"`
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
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name    string             `bson:"name" json:"name" validate:"required"`
	Type    string             `json:"type" bson:"type" validate:"required,eq=Webhook"`
	URL     string             `bson:"url" json:"url" validate:"required,url"`
	Method  string             `bson:"method" json:"method" validate:"required,oneof=POST GET PUT DELETE"`
	Headers map[string]string  `bson:"headers" json:"headers"`
}

func (s Webhook) ActionType() string {
	return s.Type
}

func (s Webhook) GetName() string {
	return s.Name
}

func NewWebhook(name string, url string, method string, headers map[string]string) *Webhook {
	return &Webhook{
		Name:    name,
		Type:    "Webhook",
		URL:     url,
		Method:  method,
		Headers: headers,
	}
}

//
// Pipeline Configuration
//

// PipelineConfiguration represents the configuration of a pipeline
type PipelineConfiguration struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name      string             `bson:"name" json:"name" validate:"required"`
	Event     PipelineEvent      `bson:"event,omitempty" json:"event,omitempty" validate:"pipelineevent"`
	Actions   []PipelineAction   `bson:"actions,omitempty" json:"actions,omitempty" validate:"dive,pipelineaction"`
	EventID   primitive.ObjectID `bson:"eventID" json:"eventID" validate:"required"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt" validate:"required"`
}

// Custom unmarshaler for PipelineConfiguration's JSON representation
func (pc *PipelineConfiguration) UnmarshalJSON(data []byte) error {
	type Alias PipelineConfiguration
	aux := &struct {
		Actions []json.RawMessage `json:"actions"`
		Event   json.RawMessage   `json:"event"`
		*Alias
	}{
		Alias: (*Alias)(pc),
	}

	// Unmarshal data into auxiliary struct
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	// Manually unmarshal event
	if len(aux.Event) > 0 {
		var baseEvent struct {
			Type string `json:"type"`
		}
		if err := json.Unmarshal(aux.Event, &baseEvent); err != nil {
			return err
		}

		if baseEvent.Type != "" {
			switch baseEvent.Type {
			case "FormSubmission":
				pc.Event = new(FormSubmission)
			case "FieldChange":
				pc.Event = new(FieldChange)
			default:
				return fmt.Errorf("unknown event type: %s", baseEvent.Type)
			}

			if err := json.Unmarshal(aux.Event, pc.Event); err != nil {
				return err
			}
		}
	}

	// Manually unmarshal actions
	for _, rawAction := range aux.Actions {
		var baseAction struct {
			Type string `json:"type"`
		}
		if err := json.Unmarshal(rawAction, &baseAction); err != nil {
			return err
		}

		if baseAction.Type != "" {
			var action PipelineAction
			switch baseAction.Type {
			case "SendEmail":
				action = new(SendEmail)
			case "AllowFormAccess":
				action = new(AllowFormAccess)
			case "Webhook":
				action = new(Webhook)
			default:
				return fmt.Errorf("unknown action type: %s", baseAction.Type)
			}

			if err := json.Unmarshal(rawAction, action); err != nil {
				return err
			}

			pc.Actions = append(pc.Actions, action)
		}
	}

	return nil
}
