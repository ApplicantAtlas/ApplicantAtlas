package config

import (
	"sync"

	"github.com/caarlos0/env/v6"
)

type APIConfig struct {
	// MESSAGE_BROKER_TYPE is the type of message broker to use
	MESSAGE_BROKER_TYPE string `env:"MESSAGE_BROKER_TYPE" envDefault:"kafka"` // kafka | sqs

	// JWT_SECRET_TOKEN is the secret key to use for JWT tokens
	JWT_SECRET_TOKEN string `env:"JWT_SECRET_TOKEN"`

	// CORS_ALLOW_ORIGINS is a comma-separated list of origins to allow CORS requests from
	CORS_ALLOW_ORIGINS []string `env:"CORS_ALLOW_ORIGINS" envSeparator:","`

	// Kafka options

	// KAFKA_BROKER_URLS is the URL of the Kafka broker
	KAFKA_BROKER_URLS []string `env:"KAFKA_BROKER_URLS" envSeparator:","`

	// SQS options
	SQS_AWS_REGION string `env:"SQS_AWS_REGION"`
	SQS_QUEUE_URL  string `env:"SQS_QUEUE_URL"`
}

var (
	apiCfg  *APIConfig
	apiOnce sync.Once
)

// LoadConfig loads the configuration from environment variables
func loadConfig() (*APIConfig, error) {
	cfg := &APIConfig{}
	err := env.Parse(cfg)
	if err != nil {
		return nil, err
	}
	return cfg, nil
}

// GetAPIConfig returns the configuration, loading it once if necessary
func GetAPIConfig() (*APIConfig, error) {
	var err error
	apiOnce.Do(func() {
		apiCfg, err = loadConfig()
	})
	if err != nil {
		return nil, err
	}
	return apiCfg, nil
}
