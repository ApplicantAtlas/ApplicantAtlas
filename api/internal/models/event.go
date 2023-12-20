package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Event represents event in database
type Event struct {
	ID            primitive.ObjectID   `bson:"_id,omitempty"`
	EventName     string               `bson:"eventName" json:"eventName"`
	OrganizerID   []primitive.ObjectID `bson:"organizerID" json:"organizerID"`
	EventTime     time.Time            `bson:"eventTime" json:"eventTime"`
	EventLocation string               `bson:"eventLocation" json:"eventLocation"`
}
