package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents a user in the database.
type User struct {
	ID                    primitive.ObjectID `bson:"_id,omitempty" json:"id" mongoPreventOverride:"true"`
	CurrentSubscriptionID primitive.ObjectID `bson:"currentSubscriptionId" json:"currentSubscriptionId"`
	FirstName             string             `bson:"firstName" json:"firstName"`
	LastName              string             `bson:"lastName" json:"lastName"`
	Email                 string             `bson:"email" json:"email"`
	Birthday              time.Time          `bson:"birthday" json:"birthday"`
	PasswordHash          string             `bson:"passwordHash" json:"-"` // Don't return the password hash
}
