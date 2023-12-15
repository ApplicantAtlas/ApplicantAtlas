package utils

import (
	"context"
	"fmt"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	Client      *mongo.Client
	mongoURI    string
	MongoDBName string
)

func init() {
	mongoURL := os.Getenv("MONGO_URL")
	mongoUser := os.Getenv("MONGO_USER")
	mongoPassword := os.Getenv("MONGO_PASSWORD")
	MongoDBName = os.Getenv("MONGO_DB")
	mongoURI = fmt.Sprintf("mongodb://%s:%s@%s/%s", mongoUser, mongoPassword, mongoURL, MongoDBName)
}

func GetMongoClient() (*mongo.Client, error) {
	return mongo.Connect(context.TODO(), options.Client().ApplyURI(mongoURI))
}
