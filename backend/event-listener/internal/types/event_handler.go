package types

import "shared/models"

type EventHandler interface {
	HandleAction(action models.PipelineAction) error
}
