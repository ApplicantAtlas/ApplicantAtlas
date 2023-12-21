// mongodb/mongodb.go
package mongodb

import (
	"api/internal/models"
	"api/internal/utils"
	"context"
	"log"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// MongoService defines the interface for interacting with MongoDB.
type MongoService interface {
	FindUserByEmail(ctx context.Context, email string) (*models.User, error)
	InsertUser(ctx context.Context, user models.User) (*mongo.InsertOneResult, error)
	DeleteUserByEmail(ctx context.Context, email string) (*mongo.DeleteResult, error)
	CreateEvent(ctx context.Context, event models.Event) (*mongo.InsertOneResult, error)
	UpdateEventMetadata(ctx *gin.Context, eventID primitive.ObjectID, metadata models.EventMetadata) (*mongo.UpdateResult, error)
	ListEventsMetadata(ctx context.Context, filter bson.M) ([]models.EventMetadata, error)
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

// Create a new event
func (s *Service) CreateEvent(ctx context.Context, event models.Event) (*mongo.InsertOneResult, error) {
	// First make sure the name exists
	if event.Metadata.Name == "" {
		return nil, ErrEventNameRequired
	}

	// Ensure the event is not visible when first created
	event.Metadata.Visibility = false
	return s.Database.Collection("events").InsertOne(ctx, event)
}

// Update an event by its ID but only if the user is an organizer
func (s *Service) UpdateEventMetadata(ctx *gin.Context, eventID primitive.ObjectID, metadata models.EventMetadata) (*mongo.UpdateResult, error) {
	authenticatedUser, ok := utils.GetUserFromContext(ctx)
	if !ok {
		return nil, ErrUserNotAuthenticated
	}

	// Lookup the event
	var event models.Event
	err := s.Database.Collection("events").FindOne(ctx, bson.M{"_id": eventID}).Decode(&event)
	if err != nil {
		return nil, err
	}

	// Ensure the user is an organizer
	isOrganizer := false
	for _, organizerID := range event.OrganizerIDs {
		if organizerID == authenticatedUser.ID {
			isOrganizer = true
			break
		}
	}
	if !isOrganizer {
		return nil, ErrUserNotAuthorized
	}

	// Update the event metadata in the database
	update := bson.M{"$set": bson.M{"metadata": metadata}}
	return s.Database.Collection("events").UpdateOne(ctx, bson.M{"_id": eventID}, update)
}

// ListEventsMetadata retrieves events based on a filter
func (s *Service) ListEventsMetadata(ctx context.Context, filter bson.M) ([]models.EventMetadata, error) {
	var events []models.EventMetadata

	cursor, err := s.Database.Collection("events").Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var event models.Event
		if err := cursor.Decode(&event); err != nil {
			return nil, err
		}
		events = append(events, event.Metadata)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	// If events is null then return an empty slice instead
	if events == nil {
		return []models.EventMetadata{}, nil
	}

	return events, nil
}
