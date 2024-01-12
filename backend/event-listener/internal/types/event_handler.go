package types

import (
	"shared/kafka"
)

type EventHandler interface {
	HandleAction(action kafka.PipelineActionMessage) error
}
