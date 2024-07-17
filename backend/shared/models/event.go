package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TODO: Add "validate" tags to these structs

// Event represents an event in the database
type Event struct {
	ID           primitive.ObjectID   `bson:"_id,omitempty" mongoPreventOverride:"true"`
	OrganizerIDs []primitive.ObjectID `bson:"organizerIDs" json:"organizerIDs"`
	CreatedByID  primitive.ObjectID   `bson:"createdByID" json:"createdByID"`
	Metadata     EventMetadata        `bson:"metadata" json:"metadata"`
}

// EventMetadata represents the user defined metadata for an event
type EventMetadata struct {
	Name string `bson:"name" json:"name" validate:"required,max=50"` // this is the only required field

	StartTime time.Time `bson:"startTime,omitempty" json:"startTime,omitempty"`                   // RFC3339
	EndTime   time.Time `bson:"endTime,omitempty" json:"endTime,omitempty"`                       // RFC3339
	Timezone  string    `bson:"timezone,omitempty" json:"timezone,omitempty" validate:"timezone"` //  IANA Time Zone

	Website      string `bson:"website,omitempty" json:"website,omitempty"`
	Description  string `bson:"description,omitempty" json:"description,omitempty" validate:"max=500"`
	ContactEmail string `bson:"contactEmail,omitempty" json:"contactEmail,omitempty"`

	LastUpdatedAt time.Time `bson:"lastUpdatedAt" json:"lastUpdatedAt"` // RFC3339
}

// Address represents a physical address
// TODO: Add validation
/*type Address struct {
	StreetAddress string `bson:"streetAddress,omitempty" json:"streetAddress,omitempty"`
	City          string `bson:"city,omitempty" json:"city,omitempty"`
	Region        string `bson:"region,omitempty" json:"region,omitempty"`
	ZipCode       string `bson:"zipCode,omitempty" json:"zipCode,omitempty"`
	Country       string `bson:"country,omitempty" json:"country,omitempty"`
}
*/
