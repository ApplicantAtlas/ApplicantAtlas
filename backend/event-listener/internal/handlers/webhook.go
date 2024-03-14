package handlers

import (
	"errors"
	"fmt"
	"shared/kafka"
	"shared/mongodb"
)

type WebhookHandler struct {
	mongo *mongodb.Service
}

func NewWebhookHandler(mongo *mongodb.Service) *WebhookHandler {
	return &WebhookHandler{mongo: mongo}
}

func (s WebhookHandler) HandleAction(action kafka.PipelineActionMessage) error {
	webhookAction, ok := action.(*kafka.WebhookMessage)
	if !ok {
		return errors.New("invalid action type for WebhookHandler")
	}
	fmt.Println(webhookAction)
	return errors.New("not implemented")
}
