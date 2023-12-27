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
