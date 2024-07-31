package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"shared/config"
)

// SlackClient is a client for sending messages to a Slack webhook
type SlackClient struct {
	WebhookURL string
}

var slackClient *SlackClient

func init() {
	apiConfig, err := config.GetAPIConfig()
	if err != nil {
		log.Fatalf("Error getting API config: %v", err)
	}
	slackClient = &SlackClient{WebhookURL: apiConfig.SLACK_WEBHOOK_URL}
}

// SendSlackMessage sends a message to the Slack webhook
func SendSlackMessage(message string) error {
	if slackClient == nil || slackClient.WebhookURL == "" {
		return nil
	}

	payload := map[string]string{"text": message}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	resp, err := http.Post(slackClient.WebhookURL, "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return fmt.Errorf("failed to send POST request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("received non-OK response from Slack: %s", resp.Status)
	}

	return nil
}
