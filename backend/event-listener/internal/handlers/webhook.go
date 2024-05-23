package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"shared/kafka"
	"shared/mongodb"
	"time"
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

	body, err := json.Marshal(webhookAction.Body)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(webhookAction.Method, webhookAction.Endpoint, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	for key, value := range webhookAction.Headers {
		req.Header.Set(key, value.(string))
	}

	if req.Header.Get("Content-Type") == "" {
		req.Header.Set("Content-Type", "application/json")
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return errors.New("failed to send webhook, received non-2xx response")
	}

	return nil
}
