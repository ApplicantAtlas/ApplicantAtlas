// mongodb/mongodb.go
package mongodb

import (
	"context"
	"errors"
	"log"
	"reflect"
	"shared/models"
	"shared/utils"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// TODO: we should prevent potentially sensitive internal fields from getting overwritten on update
// eg: id, EventID, etc just force dropping these fields on update?

// MongoService defines the interface for interacting with MongoDB.
type MongoService interface {
	FindUserByEmail(ctx context.Context, email string) (*models.User, error)
	InsertUser(ctx context.Context, user models.User) (*mongo.InsertOneResult, error)
	GetUserDetails(ctx context.Context, userId primitive.ObjectID) (*models.User, error)
	DeleteUserByEmail(ctx context.Context, email string) (*mongo.DeleteResult, error)
	UpdateUserDetails(ctx context.Context, userId primitive.ObjectID, updatedUserDetails models.User) error
	UpdateUser(ctx context.Context, userId primitive.ObjectID, user models.User) (*mongo.UpdateResult, error)
	CreateEvent(ctx context.Context, event models.Event) (*mongo.InsertOneResult, error)
	DeleteEvent(ctx *gin.Context, eventID primitive.ObjectID) (*mongo.DeleteResult, error)
	GetEvent(ctx *gin.Context, eventID primitive.ObjectID) (*models.Event, error)
	UpdateEventMetadata(ctx *gin.Context, eventID primitive.ObjectID, metadata models.EventMetadata) (*mongo.UpdateResult, error)
	ListEventsMetadata(ctx context.Context, filter bson.M) ([]models.Event, error)
	AddOrganizerToEvent(ctx context.Context, eventID primitive.ObjectID, organizerID primitive.ObjectID) (*mongo.UpdateResult, error)
	RemoveOrganizerFromEvent(ctx context.Context, eventID primitive.ObjectID, organizerID primitive.ObjectID) (*mongo.UpdateResult, error)
	CreateSource(ctx context.Context, source models.SelectorSource) (*mongo.InsertOneResult, error)
	UpdateSource(ctx context.Context, source models.SelectorSource, sourceID primitive.ObjectID) (*mongo.UpdateResult, error)
	GetSourceByName(ctx context.Context, name string) (*models.SelectorSource, error)
	ListSelectorSources(ctx context.Context) ([]models.SelectorSource, error)
	GetForm(ctx context.Context, formID primitive.ObjectID, stripSecrets bool) (*models.FormStructure, error)
	ListForms(ctx context.Context, filter bson.M) ([]models.FormStructure, error)
	CreateForm(ctx context.Context, form models.FormStructure) (*mongo.InsertOneResult, error)
	UpdateForm(ctx context.Context, form models.FormStructure, formID primitive.ObjectID) (*mongo.UpdateResult, error)
	AddAllowedSubmitter(ctx context.Context, formID primitive.ObjectID, submitter models.FormAllowedSubmitter) (*mongo.UpdateResult, error)
	DeleteForm(ctx context.Context, formID primitive.ObjectID) (*mongo.DeleteResult, error)
	CreatePipeline(ctx context.Context, pipeline models.PipelineConfiguration) (*mongo.InsertOneResult, error)
	UpdatePipeline(ctx context.Context, pipeline models.PipelineConfiguration, pipelineID primitive.ObjectID) (*mongo.UpdateResult, error)
	GetPipeline(ctx context.Context, pipelineID primitive.ObjectID) (*models.PipelineConfiguration, error)
	ListPipelines(ctx context.Context, filter bson.M) ([]models.PipelineConfiguration, error)
	DeletePipeline(ctx context.Context, pipelineID primitive.ObjectID) (*mongo.DeleteResult, error)
	ListResponses(ctx context.Context, filter bson.M, options *options.FindOptions) ([]models.FormResponse, error)
	CreateResponse(ctx context.Context, response models.FormResponse) (*mongo.InsertOneResult, error)
	UpdateResponse(ctx context.Context, response models.FormResponse, responseID primitive.ObjectID) (*mongo.UpdateResult, error)
	DeleteResponse(ctx context.Context, responseID primitive.ObjectID) (*mongo.DeleteResult, error)
	CreatePipelineRun(ctx context.Context, pipelineRun models.PipelineRun) (*mongo.InsertOneResult, error)
	GetPipelineRun(ctx context.Context, filter bson.M) (*models.PipelineRun, error)
	UpdatePipelineRun(ctx context.Context, pipelineRun models.PipelineRun, pipelineRunID primitive.ObjectID) (*mongo.UpdateResult, error)
	ListPipelineRuns(ctx context.Context, filter bson.M, options *options.FindOptions) ([]models.PipelineRun, error)
	ListEmailTemplates(ctx context.Context, filter bson.M) ([]models.EmailTemplate, error)
	CreateEmailTemplate(ctx context.Context, emailTemplate models.EmailTemplate) (*mongo.InsertOneResult, error)
	UpdateEmailTemplate(ctx context.Context, emailTemplate models.EmailTemplate, emailTemplateID primitive.ObjectID) (*mongo.UpdateResult, error)
	DeleteEmailTemplate(ctx context.Context, emailTemplateID primitive.ObjectID) (*mongo.DeleteResult, error)
	GetEmailTemplate(ctx context.Context, emailTemplateID primitive.ObjectID) (*models.EmailTemplate, error)
	GetEventSecrets(ctx context.Context, filter bson.M, stripSecrets bool) (*models.EventSecrets, error)
	CreateOrUpdateEventSecrets(ctx context.Context, secret models.EventSecrets) (*mongo.UpdateResult, error)
	DeleteEventSecrets(ctx context.Context, secretID primitive.ObjectID) (*mongo.DeleteResult, error)

	// Billing
	SeedPlans(ctx context.Context) error
	ListPlans(ctx context.Context, filter bson.M) ([]models.Plan, error)
	CreateNewSubscription(ctx context.Context, subscription models.Subscription) (*mongo.InsertOneResult, error)
	ListSubscriptions(ctx context.Context, filter bson.M) ([]models.Subscription, error)
	GetSubscription(ctx context.Context, subscriptionID primitive.ObjectID) (*models.Subscription, error)
	IncrementSubscriptionUtilization(ctx context.Context, subscriptionID primitive.ObjectID, utilizationKey string, limitKey string) (*mongo.UpdateResult, error)
	DecrementSubscriptionEventUtilization(ctx context.Context, subscriptionID primitive.ObjectID, eventID primitive.ObjectID) (*mongo.UpdateResult, error)
	//GetClient
	GetClient() (*mongo.Client)
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

func (s *Service) GetUserDetails(ctx context.Context, userId primitive.ObjectID) (*models.User, error) {
	var user models.User
	err := s.Database.Collection("users").FindOne(ctx, bson.M{"_id": userId}).Decode(&user)
	if err != nil {
		return nil, err
	}
	user.Birthday = time.Time{}
	user.PasswordHash = ""

	return &user, nil
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
	return s.Database.Collection("events").InsertOne(ctx, event)
}

// Update an event by its ID but only if the user is an organizer
func (s *Service) UpdateEventMetadata(ctx *gin.Context, eventID primitive.ObjectID, metadata models.EventMetadata) (*mongo.UpdateResult, error) {
	authenticatedUser, ok := utils.GetUserFromContext(ctx, true)
	if !ok {
		return nil, ErrUserNotAuthenticated
	}

	// Lookup the event
	var event models.Event
	err := s.Database.Collection("events").FindOne(ctx, bson.M{"_id": eventID}).Decode(&event)
	if err != nil {
		return nil, err
	}

	if !CanUserModifyEvent(ctx, s, authenticatedUser, event.ID, &event) {
		return nil, ErrUserNotAuthorized
	}

	// Update the event metadata in the database
	update := bson.M{"$set": bson.M{"metadata": metadata}}
	return s.Database.Collection("events").UpdateOne(ctx, bson.M{"_id": eventID}, update)
}

type EventMetadataWithID struct {
	ID       primitive.ObjectID `json:"id"`
	Metadata models.EventMetadata
}

// ListEventsMetadata retrieves events based on a filter
func (s *Service) ListEventsMetadata(ctx context.Context, filter bson.M) ([]models.Event, error) {
	var events []models.Event

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

		// We re-create the event here because we don't want to return the organizer IDs or hidden fields
		events = append(events, models.Event{
			ID:       event.ID,
			Metadata: event.Metadata,
		})
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	// If events is null then return an empty slice instead
	if events == nil {
		return []models.Event{}, nil
	}

	return events, nil
}

func (s *Service) AddOrganizerToEvent(ctx context.Context, eventID primitive.ObjectID, organizerID primitive.ObjectID) (*mongo.UpdateResult, error) {
	update := bson.M{
		"$addToSet": bson.M{"organizerIDs": organizerID},
	}

	return s.Database.Collection("events").UpdateByID(ctx, eventID, update)
}

func (s *Service) RemoveOrganizerFromEvent(ctx context.Context, eventID primitive.ObjectID, organizerID primitive.ObjectID) (*mongo.UpdateResult, error) {
	update := bson.M{
		"$pull": bson.M{"organizerIDs": organizerID},
	}

	return s.Database.Collection("events").UpdateByID(ctx, eventID, update)
}

// DeleteEvent deletes an event by its ID
func (s *Service) DeleteEvent(ctx *gin.Context, eventID primitive.ObjectID) (*mongo.DeleteResult, error) {
	authenticatedUser, ok := utils.GetUserFromContext(ctx, true)
	if !ok {
		return nil, ErrUserNotAuthenticated
	}

	// Lookup the event
	var event models.Event
	err := s.Database.Collection("events").FindOne(ctx, bson.M{"_id": eventID}).Decode(&event)
	if err != nil {
		return nil, err
	}

	// Ensure the user is the creator of the event
	if authenticatedUser.ID != event.CreatedByID {
		return nil, ErrUserNotAuthorized
	}

	// Delete the event
	return s.Database.Collection("events").DeleteOne(ctx, bson.M{"_id": eventID})
}

// GetEvent retrieves an event by its ID
// Returns metadata if the user is not an organizer (through ListEventsMetadata)
// Returns the full event if the user is an organizer
func (s *Service) GetEvent(ctx *gin.Context, eventID primitive.ObjectID) (*models.Event, error) {
	authenticatedUser, isAuthenticated := utils.GetUserFromContext(ctx, false)
	if authenticatedUser == nil || authenticatedUser.ID == primitive.NilObjectID {
		isAuthenticated = false
	}

	// Lookup the event
	var event models.Event
	err := s.Database.Collection("events").FindOne(ctx, bson.M{"_id": eventID}).Decode(&event)
	if err != nil {
		return nil, err
	}

	// If the user is not an organizer then return the metadata
	if !isAuthenticated || !CanUserModifyEvent(ctx, s, authenticatedUser, event.ID, &event) {
		return &models.Event{
			ID:       event.ID,
			Metadata: event.Metadata,
		}, nil
	}

	return &event, nil
}

// GetEventForms returns a list of all of the events forms
func (s *Service) ListForms(ctx context.Context, filter bson.M) ([]models.FormStructure, error) {
	var forms []models.FormStructure
	cursor, err := s.Database.Collection("forms").Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var form models.FormStructure
		if err := cursor.Decode(&form); err != nil {
			return nil, err
		}
		forms = append(forms, form)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	if forms == nil {
		return []models.FormStructure{}, nil
	}

	return forms, nil
}

// UpdateUserDetails updates a user given the user's ObjectId
func (s *Service) UpdateUserDetails(ctx context.Context, userId primitive.ObjectID, updatedUserDetails models.User) error {
	// Update the user details in the database
	update := bson.M{"$set": bson.M{
		"firstName": updatedUserDetails.FirstName,
		"lastName":  updatedUserDetails.LastName,
		"birthday":  updatedUserDetails.Birthday,
	}}

	filter := bson.M{"_id": userId}
	result, err := s.Database.Collection("users").UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("no user found with that ID")
	}

	return nil
}

func (s *Service) UpdateUser(ctx context.Context, userId primitive.ObjectID, user models.User) (*mongo.UpdateResult, error) {
	update := bson.M{"$set": user}
	filter := bson.M{"_id": userId}
	return s.Database.Collection("users").UpdateOne(ctx, filter, update)
}

// GetSourceByName retrieves a SelectorSource by its name
func (s *Service) GetSourceByName(ctx context.Context, name string) (*models.SelectorSource, error) {
	var source models.SelectorSource
	err := s.Database.Collection("sources").FindOne(ctx, bson.M{"sourceName": name}).Decode(&source)
	if err != nil {
		return nil, err
	}
	return &source, nil
}

func (s *Service) CreateSource(ctx context.Context, source models.SelectorSource) (*mongo.InsertOneResult, error) {
	_, err := s.GetSourceByName(ctx, source.SourceName)
	if err == nil {
		return nil, errors.New("source already exists")
	}
	return s.Database.Collection("sources").InsertOne(ctx, source)
}

func (s *Service) UpdateSource(ctx context.Context, source models.SelectorSource, sourceID primitive.ObjectID) (*mongo.UpdateResult, error) {
	update := bson.M{"$set": bson.M{
		"sourceName":  source.SourceName,
		"lastUpdated": source.LastUpdated,
		"options":     source.Options,
	}}

	filter := bson.M{"_id": sourceID}
	return s.Database.Collection("sources").UpdateOne(ctx, filter, update)
}

func (s *Service) ListSelectorSources(ctx context.Context) ([]models.SelectorSource, error) {
	var selectors []models.SelectorSource

	cursor, err := s.Database.Collection("sources").Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var selector models.SelectorSource
		if err := cursor.Decode(&selector); err != nil {
			return nil, err
		}

		selectors = append(selectors, selector)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	// If selectors is null then return an empty slice instead
	if selectors == nil {
		return []models.SelectorSource{}, nil
	}

	return selectors, nil
}

// GetForm retrieves a form by its ID
func (s *Service) GetForm(ctx context.Context, formID primitive.ObjectID, stripSecrets bool) (*models.FormStructure, error) {
	var form models.FormStructure
	err := s.Database.Collection("forms").FindOne(ctx, bson.M{"_id": formID}).Decode(&form)
	if err != nil {
		return nil, err
	}

	if stripSecrets {
		form.StripSecrets()
	}

	return &form, nil
}

// CreateForm creates a new form
func (s *Service) CreateForm(ctx context.Context, form models.FormStructure) (*mongo.InsertOneResult, error) {
	form.CreatedAt = time.Now()
	form.LastUpdatedAt = time.Now()
	form.IsDeleted = false
	form.Status = "draft"
	return s.Database.Collection("forms").InsertOne(ctx, form)
}

// UpdateForm updates a form by its ID
func (s *Service) UpdateForm(ctx context.Context, form models.FormStructure, formID primitive.ObjectID) (*mongo.UpdateResult, error) {
	updatePayload, err := utils.StructToBsonM(form)
	if err != nil {
		return nil, err
	}
	cleanUpdatePayload := RemoveNonOverridableFields(updatePayload, form)

	update := bson.M{"$set": cleanUpdatePayload}
	filter := bson.M{"_id": formID}
	return s.Database.Collection("forms").UpdateOne(ctx, filter, update)
}

// AddAllowedSubmitter adds a new allowed submitter to a form
func (s *Service) AddAllowedSubmitter(ctx context.Context, formID primitive.ObjectID, submitter models.FormAllowedSubmitter) (*mongo.UpdateResult, error) {
	// Prepare the update
	update := bson.M{
		"$push": bson.M{"allowedSubmitters": submitter},
	}

	// Execute the update operation
	result, err := s.Database.Collection("forms").UpdateByID(ctx, formID, update)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// DeleteForm deletes a form by its ID
func (s *Service) DeleteForm(ctx context.Context, formID primitive.ObjectID) (*mongo.DeleteResult, error) {
	filter := bson.M{"_id": formID}
	// TODO: Delete all submissions for this form
	return s.Database.Collection("forms").DeleteOne(ctx, filter)
}

// CreatePipeline creates a new pipeline
func (s *Service) CreatePipeline(ctx context.Context, pipeline models.PipelineConfiguration) (*mongo.InsertOneResult, error) {
	pipeline.LastUpdatedAt = time.Now()

	// Generate each action an ID
	for i := range pipeline.Actions {
		if pipeline.Actions[i].ID.IsZero() {
			pipeline.Actions[i].ID = primitive.NewObjectID()
		}
	}

	return s.Database.Collection("pipeline_configs").InsertOne(ctx, pipeline)
}

// UpdatePipeline updates a pipeline by its ID
func (s *Service) UpdatePipeline(ctx context.Context, pipeline models.PipelineConfiguration, pipelineID primitive.ObjectID) (*mongo.UpdateResult, error) {
	// Generate each action an ID
	for i := range pipeline.Actions {
		if pipeline.Actions[i].ID.IsZero() {
			pipeline.Actions[i].ID = primitive.NewObjectID()
		}
	}

	updatePayload, err := utils.StructToBsonM(pipeline)
	if err != nil {
		return nil, err
	}
	cleanUpdatePayload := RemoveNonOverridableFields(updatePayload, pipeline)

	update := bson.M{"$set": cleanUpdatePayload}
	filter := bson.M{"_id": pipelineID}
	return s.Database.Collection("pipeline_configs").UpdateOne(ctx, filter, update)
}

// GetPipeline retrieves a pipeline by its ID
func (s *Service) GetPipeline(ctx context.Context, pipelineID primitive.ObjectID) (*models.PipelineConfiguration, error) {
	var pipeline models.PipelineConfiguration
	err := s.Database.Collection("pipeline_configs").FindOne(ctx, bson.M{"_id": pipelineID}).Decode(&pipeline)
	if err != nil {
		return nil, err
	}
	return &pipeline, nil
}

// ListPipelines retrieves pipelines based on a filter
func (s *Service) ListPipelines(ctx context.Context, filter bson.M) ([]models.PipelineConfiguration, error) {
	var pipelines []models.PipelineConfiguration

	cursor, err := s.Database.Collection("pipeline_configs").Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var pipeline models.PipelineConfiguration
		if err := cursor.Decode(&pipeline); err != nil {
			return nil, err
		}

		pipelines = append(pipelines, pipeline)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	// If pipelines is null then return an empty slice instead
	if pipelines == nil {
		return []models.PipelineConfiguration{}, nil
	}

	return pipelines, nil
}

// DeletePipeline deletes a pipeline by its ID
func (s *Service) DeletePipeline(ctx context.Context, pipelineID primitive.ObjectID) (*mongo.DeleteResult, error) {
	filter := bson.M{"_id": pipelineID}
	return s.Database.Collection("pipeline_configs").DeleteOne(ctx, filter)
}

// ListResponses retrieves responses based on a filter
func (s *Service) ListResponses(ctx context.Context, filter bson.M, options *options.FindOptions) ([]models.FormResponse, error) {
	var responses []models.FormResponse

	cursor, err := s.Database.Collection("responses").Find(ctx, filter, options)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var response models.FormResponse
		if err := cursor.Decode(&response); err != nil {
			return nil, err
		}

		responses = append(responses, response)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	// If responses is null then return an empty slice instead
	if responses == nil {
		return []models.FormResponse{}, nil
	}

	return responses, nil
}

// CreateResponse creates a new response
func (s *Service) CreateResponse(ctx context.Context, response models.FormResponse) (*mongo.InsertOneResult, error) {
	response.LastUpdatedAt = time.Now()
	return s.Database.Collection("responses").InsertOne(ctx, response)
}

// UpdateResponse updates a response by its ID
func (s *Service) UpdateResponse(ctx context.Context, response models.FormResponse, responseID primitive.ObjectID) (*mongo.UpdateResult, error) {
	u, err := utils.StructToBsonM(response)
	if err != nil {
		return nil, err
	}
	cleanUpdatePayload := RemoveNonOverridableFields(u, response)

	update := bson.M{"$set": cleanUpdatePayload}
	filter := bson.M{"_id": responseID}
	return s.Database.Collection("responses").UpdateOne(ctx, filter, update)
}

// DeleteResponse
func (s *Service) DeleteResponse(ctx context.Context, responseID primitive.ObjectID) (*mongo.DeleteResult, error) {
	filter := bson.M{"_id": responseID}
	return s.Database.Collection("responses").DeleteOne(ctx, filter)
}

func (s *Service) CreatePipelineRun(ctx context.Context, pipelineRun models.PipelineRun) (*mongo.InsertOneResult, error) {
	return s.Database.Collection("pipeline_runs").InsertOne(ctx, pipelineRun)
}

func (s *Service) GetPipelineRun(ctx context.Context, filter bson.M) (*models.PipelineRun, error) {
	var pipelineRun models.PipelineRun
	err := s.Database.Collection("pipeline_runs").FindOne(ctx, filter).Decode(&pipelineRun)
	if err != nil {
		return nil, err
	}
	return &pipelineRun, nil
}

func (s *Service) UpdatePipelineRun(ctx context.Context, pipelineRun models.PipelineRun, pipelineRunID primitive.ObjectID) (*mongo.UpdateResult, error) {
	u, err := utils.StructToBsonM(pipelineRun)
	if err != nil {
		return nil, err
	}

	cleanUpdatePayload := RemoveNonOverridableFields(u, pipelineRun)

	update := bson.M{"$set": cleanUpdatePayload}
	filter := bson.M{"_id": pipelineRunID}
	return s.Database.Collection("pipeline_runs").UpdateOne(ctx, filter, update)
}

func (s *Service) ListPipelineRuns(ctx context.Context, filter bson.M, options *options.FindOptions) ([]models.PipelineRun, error) {
	var pipelineRuns []models.PipelineRun

	cursor, err := s.Database.Collection("pipeline_runs").Find(ctx, filter, options)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var pipelineRun models.PipelineRun
		if err := cursor.Decode(&pipelineRun); err != nil {
			return nil, err
		}

		pipelineRuns = append(pipelineRuns, pipelineRun)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	// If pipelineRuns is null then return an empty slice instead
	if pipelineRuns == nil {
		return []models.PipelineRun{}, nil
	}

	return pipelineRuns, nil
}

// ListEmailTemplates retrieves email templates based on a filter
func (s *Service) ListEmailTemplates(ctx context.Context, filter bson.M) ([]models.EmailTemplate, error) {
	var emailTemplates []models.EmailTemplate

	cursor, err := s.Database.Collection("email_templates").Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var emailTemplate models.EmailTemplate
		if err := cursor.Decode(&emailTemplate); err != nil {
			return nil, err
		}

		emailTemplates = append(emailTemplates, emailTemplate)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	// If emailTemplates is null then return an empty slice instead
	if emailTemplates == nil {
		return []models.EmailTemplate{}, nil
	}

	return emailTemplates, nil
}

// CreateEmailTemplate creates a new email template
func (s *Service) CreateEmailTemplate(ctx context.Context, emailTemplate models.EmailTemplate) (*mongo.InsertOneResult, error) {
	return s.Database.Collection("email_templates").InsertOne(ctx, emailTemplate)
}

// UpdateEmailTemplate updates an email template by its ID
func (s *Service) UpdateEmailTemplate(ctx context.Context, emailTemplate models.EmailTemplate, emailTemplateID primitive.ObjectID) (*mongo.UpdateResult, error) {
	u, err := utils.StructToBsonM(emailTemplate)
	if err != nil {
		return nil, err
	}

	cleanUpdatePayload := RemoveNonOverridableFields(u, emailTemplate)

	update := bson.M{"$set": cleanUpdatePayload}
	filter := bson.M{"_id": emailTemplateID}
	return s.Database.Collection("email_templates").UpdateOne(ctx, filter, update)
}

// DeleteEmailTemplate deletes an email template by its ID
func (s *Service) DeleteEmailTemplate(ctx context.Context, emailTemplateID primitive.ObjectID) (*mongo.DeleteResult, error) {
	return s.Database.Collection("email_templates").DeleteOne(ctx, bson.M{"_id": emailTemplateID})
}

// GetEmailTemplate retrieves an email template by its ID
func (s *Service) GetEmailTemplate(ctx context.Context, emailTemplateID primitive.ObjectID) (*models.EmailTemplate, error) {
	var emailTemplate models.EmailTemplate

	err := s.Database.Collection("email_templates").FindOne(ctx, bson.M{"_id": emailTemplateID}).Decode(&emailTemplate)
	if err != nil {
		return nil, err
	}

	return &emailTemplate, nil
}

// GetEventSecret retrieves secrets based on a filter
func (s *Service) GetEventSecrets(ctx context.Context, filter bson.M, stripSecrets bool) (*models.EventSecrets, error) {
	var data models.EventSecrets

	err := s.Database.Collection("event_secrets").FindOne(ctx, filter).Decode(&data)
	if err != nil {
		return nil, err
	}

	if stripSecrets {
		if data.Email != nil {
			stripped := data.Email.StripSecret()
			if strippedEmail, ok := stripped.(*models.EmailSecret); ok {
				data.Email = strippedEmail
			}
		}
	}

	return &data, nil
}

// CreateOrUpdateEventSecrets creates a new event secret
func (s *Service) CreateOrUpdateEventSecrets(ctx context.Context, newSecret models.EventSecrets) (*mongo.UpdateResult, error) {
	filter := bson.M{"eventID": newSecret.EventID}

	var existingSecret models.EventSecrets
	err := s.Database.Collection("event_secrets").FindOne(ctx, filter).Decode(&existingSecret)
	if err != nil && err != mongo.ErrNoDocuments {
		return nil, err
	}

	// Prepare the update document based on non-nil and changed fields in newSecret
	updateDoc := bson.M{}
	val := reflect.ValueOf(newSecret)
	typ := val.Type()
	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		fieldType := typ.Field(i)

		// Check if the field is a pointer to a struct and not nil
		if field.Kind() == reflect.Ptr && !field.IsNil() {
			fieldName := fieldType.Tag.Get("bson")

			// Get the corresponding field in the existing document
			existingField := reflect.ValueOf(existingSecret).Field(i)

			// If the fields are not deeply equal, add them to the update document
			if !reflect.DeepEqual(field.Interface(), existingField.Interface()) {
				updateDoc[fieldName] = field.Interface()
			}
		}
	}

	if len(updateDoc) == 0 {
		// No updates necessary
		return &mongo.UpdateResult{}, nil
	}

	// Perform the update with upsert true to handle cases where the document doesn't exist
	opts := options.Update().SetUpsert(true)
	result, err := s.Database.Collection("event_secrets").UpdateOne(ctx, filter, bson.M{"$set": updateDoc}, opts)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// DeleteEventSecrets
func (s *Service) DeleteEventSecrets(ctx context.Context, eventID primitive.ObjectID) (*mongo.DeleteResult, error) {
	filter := bson.M{"eventID": eventID}
	return s.Database.Collection("event_secrets").DeleteOne(ctx, filter)
}

/*
* BILLING
*
 */

const (
	PLAN_COLLECTION         = "plans"
	SUBSCRIPTION_COLLECTION = "subscriptions"
)

var (
	ERR_PLAN_NOT_FOUND_OR_LIMIT_EXCEEDED = errors.New("no active subscription found with ID, or limit exceeded")
)

// SeedPlans seeds the plans collection with the default plans, if they don't already exist
func (s *Service) SeedPlans(ctx context.Context) error {
	initialPlans := []models.Plan{
		{
			Name: "Free",
			BillingCycleOptions: models.PlanCycleOptions{
				Cycle: "monthly",
				Price: 0.0,
			},
			Limits: models.PlanLimits{
				MaxEvents:              1,
				MaxMonthlyResponses:    50,
				MaxMonthlyPipelineRuns: 50,
			},
			Default: true,
		},
		{
			Name: "Enterprise",
			BillingCycleOptions: models.PlanCycleOptions{
				Cycle: "monthly",
				Price: 1000.0,
			},
			Limits: models.PlanLimits{
				MaxEvents:              100,
				MaxMonthlyResponses:    50000,
				MaxMonthlyPipelineRuns: 50000,
			},
		},
	}

	existingPlans, err := s.ListPlans(ctx, bson.M{})
	if err != nil {
		return err
	}

	for _, plan := range initialPlans {
		for _, existingPlan := range existingPlans {
			if reflect.DeepEqual(existingPlan, plan) {
				continue
			}
		}

		_, err := s.Database.Collection(PLAN_COLLECTION).InsertOne(ctx, plan)
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *Service) ListPlans(ctx context.Context, filter bson.M) ([]models.Plan, error) {
	var plans []models.Plan

	cursor, err := s.Database.Collection(PLAN_COLLECTION).Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var plan models.Plan
		if err := cursor.Decode(&plan); err != nil {
			return nil, err
		}
		plans = append(plans, plan)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	// If plans is null then return an empty slice instead
	if plans == nil {
		return []models.Plan{}, nil
	}

	return plans, nil
}

func (s *Service) CreateNewSubscription(ctx context.Context, subscription models.Subscription) (*mongo.InsertOneResult, error) {
	return s.Database.Collection(SUBSCRIPTION_COLLECTION).InsertOne(ctx, subscription)
}
func (s *Service) ListSubscriptions(ctx context.Context, filter bson.M) ([]models.Subscription, error) {
	var subscriptions []models.Subscription

	cursor, err := s.Database.Collection(SUBSCRIPTION_COLLECTION).Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var subscription models.Subscription
		if err := cursor.Decode(&subscription); err != nil {
			return nil, err
		}
		subscriptions = append(subscriptions, subscription)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	// If subscriptions is null then return an empty slice instead
	if subscriptions == nil {
		return []models.Subscription{}, nil
	}

	return subscriptions, nil
}

func (s *Service) GetSubscription(ctx context.Context, subscriptionID primitive.ObjectID) (*models.Subscription, error) {
	var subscription models.Subscription
	err := s.Database.Collection(SUBSCRIPTION_COLLECTION).FindOne(ctx, bson.M{"_id": subscriptionID}).Decode(&subscription)
	if err != nil {
		return nil, err
	}

	return &subscription, nil
}

func (s *Service) IncrementSubscriptionUtilization(ctx context.Context, subscriptionID primitive.ObjectID, utilizationKey string, limitKey string) (*mongo.UpdateResult, error) {
	collection := s.Database.Collection(SUBSCRIPTION_COLLECTION)

	utilizationField := "utilization." + utilizationKey
	limitField := "limits." + limitKey

	update := bson.M{
		"$inc": bson.M{utilizationField: 1},
	}

	condition := bson.M{
		"$lte": []interface{}{
			bson.M{"$add": []interface{}{"$" + utilizationField, 1}},
			"$" + limitField,
		},
	}

	filter := bson.M{
		"_id":    subscriptionID,
		"status": models.SubscriptionStatusActive,
		"$expr":  condition,
	}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	if result.MatchedCount == 0 {
		return nil, ERR_PLAN_NOT_FOUND_OR_LIMIT_EXCEEDED
	}

	return result, nil
}

func (s *Service) DecrementSubscriptionEventUtilization(ctx context.Context, subscriptionID primitive.ObjectID, eventID primitive.ObjectID) (*mongo.UpdateResult, error) {
	collection := s.Database.Collection(SUBSCRIPTION_COLLECTION)

	update := bson.M{
		"$inc": bson.M{"utilization.eventsCreated": -1},
	}

	filter := bson.M{
		"_id":    subscriptionID,
		"status": models.SubscriptionStatusActive,
	}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	if result.MatchedCount == 0 {
		return nil, ERR_PLAN_NOT_FOUND_OR_LIMIT_EXCEEDED
	}

	return result, nil
}

func (s *Service) GetClient() (*mongo.Client) {
	return s.Client
}