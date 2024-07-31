package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Plan struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty" mongoPreventOverride:"true"`
	Name         string             `bson:"name" json:"name" validate:"required"`
	MonthlyPrice float64            `bson:"monthlyPrice" json:"monthlyPrice" validate:"required"`
	YearlyPrice  float64            `bson:"yearlyPrice" json:"yearlyPrice" validate:"required"`
	Limits       Limits             `bson:"limits" json:"limits" validate:"required"`
	IsDeprecated bool               `bson:"isDeprecated" json:"isDeprecated"`
}

// Limits represents the limits of a plan
type Limits struct {
	MaxEvents          int `bson:"maxEvents" json:"maxEvents" validate:"required"`
	MaxPipelineRuns    int `bson:"maxPipelineRuns" json:"maxPipelineRuns" validate:"required"`
	MaxFormSubmissions int `bson:"maxFormSubmissions" json:"maxFormSubmissions" validate:"required"`
}

// Usage represents the current month's usage of a subscription
type Usage struct {
	Events          int `bson:"events" json:"events"`
	PipelineRuns    int `bson:"pipelineRuns" json:"pipelineRuns"`
	FormSubmissions int `bson:"formSubmissions" json:"formSubmissions"`
}

type Subscription struct {
	ID                    primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty" mongoPreventOverride:"true"`
	UserID                primitive.ObjectID `bson:"userID" json:"userID" validate:"required"`
	PlanID                primitive.ObjectID `bson:"planID" json:"planID" validate:"required"`
	SubscriptionStartTime time.Time          `bson:"subscriptionStartTime" json:"subscriptionStartTime" validate:"required"`
	SubscriptionEndTime   time.Time          `bson:"subscriptionEndTime" json:"subscriptionEndTime"`
	IsActive              bool               `bson:"isActive" json:"isActive"`
	IsYearly              bool               `bson:"isYearly" json:"isYearly"`
	Usage                 Usage              `bson:"usage" json:"usage"`
}

type MonthlyUsage struct {
	SubscriptionID primitive.ObjectID `bson:"subscriptionID" json:"subscriptionID"`
	Month          time.Time          `bson:"month" json:"month"`
	Usage          Usage              `bson:"usage" json:"usage"`
}
