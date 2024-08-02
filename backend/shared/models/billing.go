package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	SubscriptionStatusActive    = "active"
	SubscriptionStatusCancelled = "cancelled"
	SubscriptionStatusPaused    = "paused"
)

type Plan struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name                string             `bson:"name" json:"name"`
	BillingCycleOptions PlanCycleOptions   `bson:"billingCycleOptions" json:"billingCycleOptions"`
	Limits              PlanLimits         `bson:"limits" json:"limits"`
	Default             bool               `bson:"default" json:"default"`
}

type PlanLimits struct {
	MaxEvents              int `bson:"maxEvents" json:"maxEvents"`
	MaxMonthlyResponses    int `bson:"maxMonthlyResponses" json:"maxMonthlyResponses"`
	MaxMonthlyPipelineRuns int `bson:"maxMonthlyPipelineRuns" json:"maxMonthlyPipelineRuns"`
}

type PlanCycleOptions struct {
	Cycle string  `bson:"cycle" json:"cycle" oneOf:"monthly six-months yearly"`
	Price float32 `bson:"price" json:"price"`
}

type Subscription struct {
	ID                       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID                   primitive.ObjectID `bson:"userId" json:"userId"`
	PlanID                   primitive.ObjectID `bson:"planId" json:"planId"`
	StartDate                time.Time          `bson:"startDate" json:"startDate"`
	EndDate                  time.Time          `bson:"endDate" json:"endDate"`
	Status                   string             `bson:"status" json:"status" oneOf:"active cancelled paused"`
	BillingCycle             string             `bson:"billingCycle" json:"billingCycle" oneOf:"monthly six-months yearly"`
	NextUtilizationResetDate time.Time          `bson:"nextUtilizationResetDate" json:"nextUtilizationResetDate"`
	Utilization              Utilization        `bson:"utilization" json:"utilization"` // will need cron job to reset this scheduled to run every 24h
	Limits                   PlanLimits         `bson:"limits" json:"limits"`
}

type Utilization struct {
	EventsCreated int `bson:"eventsCreated" json:"eventsCreated"`
	Responses     int `bson:"responses" json:"responses"`
	PipelineRuns  int `bson:"pipelineRuns" json:"pipelineRuns"`
}
