package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

/*
This section is for modeling the default values for Selectors when we fetch data from external sources to cache
Like MLH's School List
*/
type SelectorSource struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	SourceName  string             `bson:"sourceName" json:"sourceName"`
	LastUpdated time.Time          `bson:"lastUpdated" json:"lastUpdated"`
	Options     []string           `bson:"options" json:"options"`
}

// Address represents a physical address
type Address struct {
	StreetAddress string `json:"streetAddress,omitempty" bson:"streetAddress,omitempty"`
	City          string `json:"city,omitempty" bson:"city,omitempty"`
	Region        string `json:"region,omitempty" bson:"region,omitempty"`
	ZipCode       string `json:"zipCode,omitempty" bson:"zipCode,omitempty"`
	Country       string `json:"country,omitempty" bson:"country,omitempty"`
}

// EmailValidationOptions for validating email fields
type EmailValidationOptions struct {
	IsEmail         bool     `json:"isEmail,omitempty" bson:"isEmail,omitempty"`
	RequireDomain   []string `json:"requireDomain,omitempty" bson:"requireDomain,omitempty"`
	AllowSubdomains bool     `json:"allowSubdomains,omitempty" bson:"allowSubdomains,omitempty"`
	AllowTLDs       []string `json:"allowTLDs,omitempty" bson:"allowTLDs,omitempty"`
}

// FieldValidation for additional validation rules
type FieldValidation struct {
	Min     int                    `json:"min,omitempty" bson:"min,omitempty"`
	Max     int                    `json:"max,omitempty" bson:"max,omitempty"`
	IsEmail EmailValidationOptions `json:"isEmail,omitempty" bson:"isEmail,omitempty"`
}

// AdditionalOptions for extra field-specific settings
type AdditionalOptions struct {
	DefaultTimezone      string `json:"defaultTimezone,omitempty" bson:"defaultTimezone,omitempty"`
	ShowTimezone         bool   `json:"showTimezone,omitempty" bson:"showTimezone,omitempty"`
	IsPassword           bool   `json:"isPassword,omitempty" bson:"isPassword,omitempty"`
	UseDefaultValuesFrom string `json:"useDefaultValuesFrom,omitempty" bson:"useDefaultValuesFrom,omitempty"`
}

// FormFieldType for defining the type of a form field
type FormFieldType string

// FieldValue represents the value a field can hold
type FieldValue interface{}

// FormField represents a single field in a form
type FormField struct {
	Question             string            `json:"question" bson:"question" validate:"required"`
	Type                 FormFieldType     `json:"type" bson:"type" validate:"required"`
	Description          string            `json:"description,omitempty" bson:"description,omitempty" validate:"max=1000"`
	AdditionalValidation FieldValidation   `json:"additionalValidation,omitempty" bson:"additionalValidation,omitempty"`
	Key                  string            `json:"key" bson:"key" validate:"required"`
	DefaultValue         FieldValue        `json:"defaultValue,omitempty" bson:"defaultValue,omitempty"`
	Options              []string          `json:"options,omitempty" bson:"options,omitempty"`
	DefaultOptions       []string          `json:"defaultOptions,omitempty" bson:"defaultOptions,omitempty"`
	Required             bool              `json:"required,omitempty" bson:"required,omitempty"`
	Disabled             bool              `json:"disabled,omitempty" bson:"disabled,omitempty"`
	AdditionalOptions    AdditionalOptions `json:"additionalOptions,omitempty" bson:"additionalOptions,omitempty"`
}

// FormAllowedSubmitter represents a user who is allowed to submit a form with additional options
type FormAllowedSubmitter struct {
	Email     string    `json:"email" bson:"email" validate:"required,email"`
	ExpiresAt time.Time `json:"expiresAt,omitempty" bson:"expiresAt,omitempty"`
}

// FormStructure represents the overall structure of a form
type FormStructure struct {
	Attrs                    []FormField            `json:"attrs" bson:"attrs"`
	ID                       primitive.ObjectID     `json:"id,omitempty" bson:"_id,omitempty"`
	AllowMultipleSubmissions bool                   `json:"allowMultipleSubmissions,omitempty" bson:"allowMultipleSubmissions,omitempty"`
	CloseSubmissionsAt       time.Time              `json:"closeSubmissionsAt,omitempty" bson:"closeSubmissionsAt,omitempty"`
	OpenSubmissionsAt        time.Time              `json:"openSubmissionsAt,omitempty" bson:"openSubmissionsAt,omitempty"`
	Name                     string                 `json:"name,omitempty" bson:"name,omitempty"`
	Description              string                 `json:"description,omitempty" bson:"description,omitempty"`
	CreatedAt                time.Time              `json:"createdAt,omitempty" bson:"createdAt,omitempty"`
	UpdatedAt                time.Time              `json:"updatedAt,omitempty" bson:"updatedAt,omitempty"`
	Status                   string                 `json:"status,omitempty" bson:"status,omitempty"`
	IsDeleted                bool                   `json:"isDeleted,omitempty" bson:"isDeleted,omitempty"`
	EventID                  primitive.ObjectID     `json:"eventID,omitempty" bson:"eventID,omitempty"`
	MaxSubmissions           int                    `json:"maxSubmissions,omitempty" bson:"maxSubmissions,omitempty"`
	SubmissionMessage        string                 `json:"submissionMessage,omitempty" bson:"submissionMessage,omitempty"`
	IsRestricted             bool                   `json:"isRestricted,omitempty" bson:"isRestricted,omitempty"`
	AllowedSubmitters        []FormAllowedSubmitter `json:"allowedSubmitters,omitempty" bson:"allowedSubmitters,omitempty"`
}

// StripSecrets removes any sensitive information from the form
func (f *FormStructure) StripSecrets() {
	// Note: it would be nice to just abstract this out to filter when secret:"true" and for all models
	f.AllowedSubmitters = nil
}
