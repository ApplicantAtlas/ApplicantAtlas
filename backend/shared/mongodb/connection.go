package mongodb

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"shared/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	Client      *mongo.Client
	mongoURI    string
	MongoDBName string
)

func init() {
	mongoConfig, err := config.GetMongoConfig()
	if err != nil {
		fmt.Println("Error getting MongoDB config: ", err)
		os.Exit(1)
	}

	MongoDBName = mongoConfig.MONGO_DB
	encodedUser := url.QueryEscape(mongoConfig.MONGO_USER)
	encodedPassword := url.QueryEscape(mongoConfig.MONGO_PASSWORD)

	mongoURI = fmt.Sprintf("%s://%s:%s@%s/%s", mongoConfig.MONGO_CONNECTION_TYPE, encodedUser, encodedPassword, mongoConfig.MONGO_URL, mongoConfig.MONGO_DB)
	if mongoConfig.MONGO_EXTRA_PARAMS != "" || mongoConfig.MONGO_AUTH_SOURCE != "" {
		mongoURI = mongoURI + "?"
	}

	if mongoConfig.MONGO_AUTH_SOURCE != "" {
		mongoURI = mongoURI + fmt.Sprintf("authSource=%s", mongoConfig.MONGO_AUTH_SOURCE)
	}

	if mongoConfig.MONGO_EXTRA_PARAMS != "" {
		if mongoConfig.MONGO_AUTH_SOURCE != "" {
			mongoURI = mongoURI + "&"
		}
		mongoURI = mongoURI + mongoConfig.MONGO_EXTRA_PARAMS
	}
}

func getMongoClient() (*mongo.Client, error) {
	return mongo.Connect(context.TODO(), options.Client().ApplyURI(mongoURI))
}
