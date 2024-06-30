package mongodb

import (
	"context"
	"fmt"
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
	mongoURI = fmt.Sprintf("mongodb://%s:%s@%s/%s", mongoConfig.MONGO_USER, mongoConfig.MONGO_PASSWORD, mongoConfig.MONGO_URL, mongoConfig.MONGO_DB)
	if mongoConfig.MONGO_AUTH_SOURCE != "" {
		mongoURI = mongoURI + fmt.Sprintf("?authSource=%s", mongoConfig.MONGO_AUTH_SOURCE)
	}
}

func getMongoClient() (*mongo.Client, error) {
	fmt.Println("Connecting to MongoDB with URI: ", mongoURI)
	return mongo.Connect(context.TODO(), options.Client().ApplyURI(mongoURI))
}
