package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents a user in the database.
type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" mongoPreventOverride:"true"`
	FirstName    string             `bson:"firstName" json:"firstName"`
	LastName     string             `bson:"lastName" json:"lastName"`
	Email        string             `bson:"email" json:"email"`
	SchoolEmail  string             `bson:"schoolEmail,omitempty" json:"schoolEmail,omitempty"`
	Birthday     time.Time          `bson:"birthday" json:"birthday"`
	PasswordHash string             `bson:"passwordHash" json:"-"` // Don't return the password hash
}
