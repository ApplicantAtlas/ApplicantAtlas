package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TODO: Add "validate" tags to these structs

// Event represents an event in the database
type Event struct {
	ID           primitive.ObjectID   `bson:"_id,omitempty"`
	OrganizerIDs []primitive.ObjectID `bson:"organizerIDs" json:"organizerIDs"`
	Metadata     EventMetadata        `bson:"metadata" json:"metadata"`
}

// EventMetadata represents the user defined metadata for an event
type EventMetadata struct {
	Name string `bson:"name" json:"name" validate:"required,max=30"` // this is the only required field

	Address  Address `bson:"address,omitempty" json:"address,omitempty"`
	EventLat float64 `bson:"lat,omitempty" json:"lat,omitempty"` // TODO: Derive this from address
	EventLon float64 `bson:"lon,omitempty" json:"lon,omitempty"` // TODO: Derive this from address

	StartTime time.Time `bson:"startTime,omitempty" json:"startTime,omitempty"`                   // RFC3339
	EndTime   time.Time `bson:"endTime,omitempty" json:"endTime,omitempty"`                       // RFC3339
	Timezone  string    `bson:"timezone,omitempty" json:"timezone,omitempty" validate:"timezone"` //  IANA Time Zone

	Visibility       bool     `bson:"visibility,omitempty" json:"visibility,omitempty" validate:"requireExistsIf=true;Address;ContactEmail;Description"`
	Website          string   `bson:"website,omitempty" json:"website,omitempty"`
	Description      string   `bson:"description,omitempty" json:"description,omitempty" validate:"max=500"`
	SocialMediaLinks []string `bson:"socialMediaLinks,omitempty" json:"socialMediaLinks,omitempty"`
	EventTags        []string `bson:"eventTags,omitempty" json:"eventTags,omitempty"`
	ContactEmail     string   `bson:"contactEmail,omitempty" json:"contactEmail,omitempty"`
}

// Address represents a physical address
type Address struct {
	Street     string `bson:"street,omitempty" json:"street,omitempty"`
	City       string `bson:"city,omitempty" json:"city,omitempty"`
	State      string `bson:"state,omitempty" json:"state,omitempty"`
	PostalCode string `bson:"postalCode,omitempty" json:"postalCode,omitempty"`
	Country    string `bson:"country,omitempty" json:"country,omitempty"`
}
