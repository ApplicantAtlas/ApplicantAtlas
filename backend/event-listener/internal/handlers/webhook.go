package handlers

import (
	"errors"
	"fmt"
	"shared/models"
)

type WebhookHandler struct{}

func (s WebhookHandler) HandleAction(action models.PipelineAction) error {
	webhookAction, ok := action.(models.Webhook)
	if !ok {
		return errors.New("invalid action type for WebhookHandler")
	}
	fmt.Println(webhookAction)
	return errors.New("not implemented")
}
