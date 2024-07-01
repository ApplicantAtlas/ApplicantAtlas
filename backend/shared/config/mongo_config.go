package config

import (
	"sync"

	"github.com/caarlos0/env/v6"
)

type MongoConfig struct {
	MONGO_CONNECTION_TYPE string `env:"MONGO_CONNECTION_TYPE" envDefault:"mongodb"`

	// MONGO_URL is the URL of the MongoDB instance
	MONGO_URL string `env:"MONGO_URL"`

	// MONGO_USER is the username to use to connect to MongoDB
	MONGO_USER string `env:"MONGO_USER"`

	// MONGO_PASSWORD is the password to use to connect to MongoDB
	MONGO_PASSWORD string `env:"MONGO_PASSWORD"`

	// MONGO_DB is the name of the MongoDB database to use
	MONGO_DB string `env:"MONGO_DB"`

	// MONGO_AUTH_SOURCE is the authentication source to use when connecting to MongoDB
	MONGO_AUTH_SOURCE string `env:"MONGO_AUTH_SOURCE"`

	// MONGO_EXTRA_PARAMS is any extra parameters to use when connecting to MongoDB
	MONGO_EXTRA_PARAMS string `env:"MONGO_EXTRA_PARAMS"`
}

var (
	mongoCfg  *MongoConfig
	mongoOnce sync.Once
)

func loadMongoConfig() (*MongoConfig, error) {
	cfg := &MongoConfig{}
	err := env.Parse(cfg)
	if err != nil {
		return nil, err
	}
	return cfg, nil
}

// GetMongoConfig returns the configuration, loading it once if necessary
func GetMongoConfig() (*MongoConfig, error) {
	var err error
	mongoOnce.Do(func() {
		mongoCfg, err = loadMongoConfig()
	})
	if err != nil {
		return nil, err
	}
	return mongoCfg, nil
}
