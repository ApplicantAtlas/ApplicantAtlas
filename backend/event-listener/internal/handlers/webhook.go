package handlers

import (
	"errors"
	"fmt"
	"shared/kafka"
)

type WebhookHandler struct{}

func (s WebhookHandler) HandleAction(action kafka.PipelineActionMessage) error {
	webhookAction, ok := action.(*kafka.WebhookMessage)
	if !ok {
		return errors.New("invalid action type for WebhookHandler")
	}
	fmt.Println(webhookAction)
	return errors.New("not implemented")
}
