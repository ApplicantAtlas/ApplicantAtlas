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
	ID          primitive.ObjectID `bson:"_id" json:"id" mongoPreventOverride:"true"`
	Description string             `bson:"description" json:"description"`
	SourceName  string             `bson:"sourceName" json:"sourceName"`
	LastUpdated time.Time          `bson:"lastUpdated" json:"lastUpdated"`
	Options     []string           `bson:"options" json:"options"`
}

// Address represents a physical address
type Address struct {
	StreetAddress string `json:"streetAddress,omitempty" bson:"streetAddress"`
	City          string `json:"city,omitempty" bson:"city"`
	Region        string `json:"region,omitempty" bson:"region"`
	ZipCode       string `json:"zipCode,omitempty" bson:"zipCode"`
	Country       string `json:"country,omitempty" bson:"country"`
}

// EmailValidationOptions for validating email fields
type EmailValidationOptions struct {
	IsEmail         bool     `json:"isEmail,omitempty" bson:"isEmail"`
	RequireDomain   []string `json:"requireDomain,omitempty" bson:"requireDomain"`
	AllowSubdomains bool     `json:"allowSubdomains,omitempty" bson:"allowSubdomains"`
	AllowTLDs       []string `json:"allowTLDs,omitempty" bson:"allowTLDs"`
}

// FieldValidation for additional validation rules
type FieldValidation struct {
	Min                           int                    `json:"min,omitempty" bson:"min"`
	Max                           int                    `json:"max,omitempty" bson:"max"`
	DateAndTimestampFromTimeField time.Time              `json:"dateAndTimestampFromTimeField,omitempty" bson:"dateAndTimestampFromTimeField"` // used for min & max age validation around a given timestamp
	IsEmail                       EmailValidationOptions `json:"isEmail,omitempty" bson:"isEmail"`
}

// AdditionalOptions for extra field-specific settings
type AdditionalOptions struct {
	DefaultTimezone      string `json:"defaultTimezone,omitempty" bson:"defaultTimezone"`
	ShowTimezone         bool   `json:"showTimezone,omitempty" bson:"showTimezone"`
	IsPassword           bool   `json:"isPassword,omitempty" bson:"isPassword"`
	UseDefaultValuesFrom string `json:"useDefaultValuesFrom,omitempty" bson:"useDefaultValuesFrom"`
}

// FormFieldType for defining the type of a form field
type FormFieldType string

// FieldValue represents the value a field can hold
type FieldValue string // TODO: maybe should union type

// FormField represents a single field in a form
type FormField struct {
	Question             string            `json:"question" bson:"question" validate:"required"`
	Type                 FormFieldType     `json:"type" bson:"type" validate:"required"`
	Description          string            `json:"description,omitempty" bson:"description,omitempty" validate:"max=1000"`
	AdditionalValidation FieldValidation   `json:"additionalValidation,omitempty" bson:"additionalValidation,omitempty"`
	Key                  string            `json:"key" bson:"key" validate:"required,uuidv4"`
	DefaultValue         FieldValue        `json:"defaultValue,omitempty" bson:"defaultValue,omitempty"`
	Options              []string          `json:"options,omitempty" bson:"options,omitempty"`
	DefaultOptions       []string          `json:"defaultOptions,omitempty" bson:"defaultOptions,omitempty"`
	Required             bool              `json:"required,omitempty" bson:"required"`
	Disabled             bool              `json:"disabled,omitempty" bson:"disabled"`
	AdditionalOptions    AdditionalOptions `json:"additionalOptions,omitempty" bson:"additionalOptions,omitempty"`
	IsInternal           bool              `json:"isInternal" bson:"isInternal"`
}

// FormAllowedSubmitter represents a user who is allowed to submit a form with additional options
type FormAllowedSubmitter struct {
	Email     string    `json:"email" bson:"email" validate:"required,email"`
	ExpiresAt time.Time `json:"expiresAt,omitempty" bson:"expiresAt,omitempty"`
}

// FormStructure represents the overall structure of a form
type FormStructure struct {
	Attrs                    []FormField            `json:"attrs" bson:"attrs" validate:"dive"`
	ID                       primitive.ObjectID     `json:"id,omitempty" bson:"_id,omitempty" mongoPreventOverride:"true"`
	AllowMultipleSubmissions bool                   `json:"allowMultipleSubmissions,omitempty" bson:"allowMultipleSubmissions"`
	CloseSubmissionsAt       time.Time              `json:"closeSubmissionsAt,omitempty" bson:"closeSubmissionsAt"`
	OpenSubmissionsAt        time.Time              `json:"openSubmissionsAt,omitempty" bson:"openSubmissionsAt"`
	Name                     string                 `json:"name,omitempty" bson:"name"`
	Description              string                 `json:"description,omitempty" bson:"description"`
	CreatedAt                time.Time              `json:"createdAt,omitempty" bson:"createdAt"`
	UpdatedAt                time.Time              `json:"updatedAt,omitempty" bson:"updatedAt"`
	Status                   string                 `json:"status,omitempty" bson:"status"`
	IsDeleted                bool                   `json:"isDeleted,omitempty" bson:"isDeleted"`
	EventID                  primitive.ObjectID     `json:"eventID,omitempty" bson:"eventID" mongoPreventOverride:"true"`
	MaxSubmissions           int                    `json:"maxSubmissions,omitempty" bson:"maxSubmissions"`
	SubmissionMessage        string                 `json:"submissionMessage,omitempty" bson:"submissionMessage"`
	IsRestricted             bool                   `json:"isRestricted,omitempty" bson:"isRestricted"`
	AllowedSubmitters        []FormAllowedSubmitter `json:"allowedSubmitters,omitempty" bson:"allowedSubmitters" validate:"dive"`
}

// StripSecrets removes any sensitive information from the form
func (f *FormStructure) StripSecrets() {
	// Note: it would be nice to just abstract this out to filter when secret:"true" and for all models
	f.AllowedSubmitters = nil
}
