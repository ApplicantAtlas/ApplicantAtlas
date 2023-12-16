// mongodb/mongodb.go
package mongodb

import (
	"api/internal/models"
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// MongoService defines the interface for interacting with MongoDB.
type MongoService interface {
	FindUserByEmail(ctx context.Context, email string) (*models.User, error)
	InsertUser(ctx context.Context, user models.User) (*mongo.InsertOneResult, error)
	DeleteUserByEmail(ctx context.Context, email string) (*mongo.DeleteResult, error)
}

// Service implements MongoService with a mongo.Client.
type Service struct {
	Client   *mongo.Client
	Database *mongo.Database
}

// NewService creates a new Service.
func NewService() (*Service, func(), error) {
	// TODO: We might want to initialize the connection lazily
	client, err := getMongoClient()
	if err != nil {
		return nil, nil, err
	}

	// Cleanup function
	cleanup := func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Printf("Error disconnecting from MongoDB: %s", err)
		}
	}

	database := client.Database(MongoDBName)
	return &Service{Client: client, Database: database}, cleanup, nil
}

// FindUserByEmail finds a user by their email.
func (s *Service) FindUserByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := s.Database.Collection("users").FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// InsertUser inserts a new user into the database.
func (s *Service) InsertUser(ctx context.Context, user models.User) (*mongo.InsertOneResult, error) {
	// First check if email is already registered
	_, err := s.FindUserByEmail(ctx, user.Email)
	if err == nil {
		return nil, ErrUserAlreadyExists
	}
	return s.Database.Collection("users").InsertOne(ctx, user)
}

// DeleteUserByEmail deletes a user by their email.
func (s *Service) DeleteUserByEmail(ctx context.Context, email string) (*mongo.DeleteResult, error) {
	return s.Database.Collection("users").DeleteOne(ctx, bson.M{"email": email})
}
