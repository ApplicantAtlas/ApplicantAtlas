package config

import (
	"sync"

	"github.com/caarlos0/env/v6"
)

type EventListenerConfig struct {
	// Kafka options

	// KAFKA_BROKER_URLS is the URL of the Kafka brokers to connect to
	KAFKA_BROKER_URLS []string `env:"KAFKA_BROKER_URLS" envSeparator:","`
}

var (
	eventListenerCfg  *EventListenerConfig
	eventListenerOnce sync.Once
)

func loadEventListenerConfig() (*EventListenerConfig, error) {
	cfg := &EventListenerConfig{}
	err := env.Parse(cfg)
	if err != nil {
		return nil, err
	}
	return cfg, nil
}

// GetEventListenerConfig returns the configuration, loading it once if necessary
func GetEventListenerConfig() (*EventListenerConfig, error) {
	var err error
	eventListenerOnce.Do(func() {
		eventListenerCfg, err = loadEventListenerConfig()
	})
	if err != nil {
		return nil, err
	}
	return eventListenerCfg, nil
}
