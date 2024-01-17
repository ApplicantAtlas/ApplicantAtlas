package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// FormResponse represents a form response
type FormResponse struct {
	ID        primitive.ObjectID     `bson:"_id,omitempty" json:"id,omitempty"`
	FormID    primitive.ObjectID     `bson:"formID" json:"formID" validate:"required"`
	Data      map[string]interface{} `bson:"data" json:"data" validate:"required"`
	UserID    primitive.ObjectID     `bson:"userID" json:"userID"`
	CreatedAt time.Time              `bson:"createdAt" json:"createdAt" validate:"required"`
}
