package mongodb

import (
	"context"
	"errors"
	"shared/models"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MockMongoService struct {
	mock.Mock
	data      map[string]models.User // In-memory store
	events    map[string]models.Event
	sources   map[string]models.SelectorSource
	forms     map[string]models.FormStructure
	pipelines map[string]models.PipelineConfiguration
	mutex     sync.RWMutex // Mutex for concurrent access
}

func NewMockMongoService() *MockMongoService {
	return &MockMongoService{
		data:      make(map[string]models.User),
		events:    make(map[string]models.Event),
		sources:   make(map[string]models.SelectorSource),
		forms:     make(map[string]models.FormStructure),
		pipelines: make(map[string]models.PipelineConfiguration),
	}
}

func (m *MockMongoService) FindUserByEmail(ctx context.Context, email string) (*models.User, error) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	user, exists := m.data[email]
	if !exists {
		return nil, mongo.ErrNoDocuments
	}
	return &user, nil
}

func (m *MockMongoService) InsertUser(ctx context.Context, user models.User) (*mongo.InsertOneResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	if _, exists := m.data[user.Email]; exists {
		return nil, ErrUserAlreadyExists
	}

	m.data[user.Email] = user
	return &mongo.InsertOneResult{}, nil // Mock result
}

func (m *MockMongoService) DeleteUserByEmail(ctx context.Context, email string) (*mongo.DeleteResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	if _, exists := m.data[email]; !exists {
		return nil, mongo.ErrNoDocuments
	}

	delete(m.data, email)
	return &mongo.DeleteResult{}, nil // Mock result
}

func (m *MockMongoService) CreateEvent(ctx context.Context, event models.Event) (*mongo.InsertOneResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	// Generate event.ID
	event.ID = primitive.NewObjectID()

	id := event.ID.Hex()
	if _, exists := m.data[id]; exists {
		return nil, errors.New("event already exists")
	}

	m.events[id] = event
	return &mongo.InsertOneResult{InsertedID: event.ID}, nil
}

func (m *MockMongoService) UpdateEventMetadata(ctx *gin.Context, eventID primitive.ObjectID, metadata models.EventMetadata) (*mongo.UpdateResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	id := eventID.Hex()
	event, exists := m.events[id]
	if !exists {
		return nil, mongo.ErrNoDocuments
	}

	// Update metadata
	event.Metadata = metadata
	m.events[id] = event
	return &mongo.UpdateResult{ModifiedCount: 1}, nil
}

func (m *MockMongoService) ListEventsMetadata(ctx context.Context, filter bson.M) ([]models.Event, error) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	var events []models.Event
	for _, event := range m.events {
		if matchesFilter(event, filter) {
			events = append(events, event)
		}
	}
	return events, nil
}

func (m *MockMongoService) DeleteEvent(ctx *gin.Context, eventID primitive.ObjectID) (*mongo.DeleteResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	id := eventID.Hex()
	if _, exists := m.data[id]; !exists {
		return nil, mongo.ErrNoDocuments
	}

	delete(m.data, id)
	return &mongo.DeleteResult{DeletedCount: 1}, nil
}

func (m *MockMongoService) GetEvent(ctx *gin.Context, eventID primitive.ObjectID) (*models.Event, error) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	id := eventID.Hex()
	event, exists := m.events[id]
	if !exists {
		return nil, mongo.ErrNoDocuments
	}

	return &event, nil
}

func (m *MockMongoService) UpdateUserDetails(ctx context.Context, userId primitive.ObjectID, updatedUserDetails models.User) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	id := userId.Hex()
	if _, exists := m.data[id]; !exists {
		return mongo.ErrNoDocuments
	}

	// Update user details
	m.data[id] = updatedUserDetails
	return nil
}

func (m *MockMongoService) CreateSource(ctx context.Context, source models.SelectorSource) (*mongo.InsertOneResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	if _, exists := m.sources[source.SourceName]; exists {
		return nil, errors.New("source already exists")
	}

	m.sources[source.SourceName] = source
	return &mongo.InsertOneResult{}, nil
}

func (m *MockMongoService) GetSourceByName(ctx context.Context, name string) (*models.SelectorSource, error) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	source, exists := m.sources[name]
	if !exists {
		return nil, mongo.ErrNoDocuments
	}

	return &source, nil
}

func (m *MockMongoService) UpdateSource(ctx context.Context, source models.SelectorSource, sourceID primitive.ObjectID) (*mongo.UpdateResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	id := sourceID.Hex()
	if _, exists := m.sources[id]; !exists {
		return nil, mongo.ErrNoDocuments
	}

	// Update source
	m.sources[id] = source
	return &mongo.UpdateResult{ModifiedCount: 1}, nil
}

// matchesFilter is a helper function that matches an event against a filter.
// This is a simplified example. You would need to implement matching logic
// based on your application's requirements.
func matchesFilter(event models.Event, filter bson.M) bool {
	for k, v := range filter {
		// Example of matching by event name
		if k == "name" && event.Metadata.Name != v {
			return false
		}
		// Add other filter conditions as needed
	}
	return true
}

func (m *MockMongoService) CreateForm(ctx context.Context, form models.FormStructure) (*mongo.InsertOneResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	if _, exists := m.forms[form.Name]; exists {
		return nil, errors.New("form already exists")
	}

	m.forms[form.Name] = form
	return &mongo.InsertOneResult{}, nil
}

func (m *MockMongoService) GetForm(ctx context.Context, formID primitive.ObjectID) (*models.FormStructure, error) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	id := formID.Hex()
	form, exists := m.forms[id]
	if !exists {
		return nil, mongo.ErrNoDocuments
	}

	return &form, nil
}

func (m *MockMongoService) UpdateForm(ctx context.Context, form models.FormStructure, formID primitive.ObjectID) (*mongo.UpdateResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	id := formID.Hex()
	if _, exists := m.forms[id]; !exists {
		return nil, mongo.ErrNoDocuments
	}

	// Update form
	m.forms[id] = form
	return &mongo.UpdateResult{ModifiedCount: 1}, nil
}

func (m *MockMongoService) DeleteForm(ctx context.Context, formID primitive.ObjectID) (*mongo.DeleteResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	id := formID.Hex()
	if _, exists := m.forms[id]; !exists {
		return nil, mongo.ErrNoDocuments
	}

	delete(m.forms, id)
	return &mongo.DeleteResult{DeletedCount: 1}, nil
}

func (m *MockMongoService) CreatePipeline(ctx context.Context, pipeline models.PipelineConfiguration) (*mongo.InsertOneResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	// Generate a new ObjectID for the pipeline
	pipeline.ID = primitive.NewObjectID()
	id := pipeline.ID.Hex()

	// Check if the pipeline already exists
	if _, exists := m.pipelines[id]; exists {
		return nil, errors.New("pipeline already exists")
	}

	m.pipelines[id] = pipeline
	return &mongo.InsertOneResult{InsertedID: pipeline.ID}, nil
}

func (m *MockMongoService) UpdatePipeline(ctx context.Context, pipeline models.PipelineConfiguration, pipelineID primitive.ObjectID) (*mongo.UpdateResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	id := pipelineID.Hex()
	if _, exists := m.pipelines[id]; !exists {
		return nil, mongo.ErrNoDocuments
	}

	// Update the pipeline
	m.pipelines[id] = pipeline
	return &mongo.UpdateResult{ModifiedCount: 1}, nil
}

func (m *MockMongoService) GetPipeline(ctx context.Context, pipelineID primitive.ObjectID) (*models.PipelineConfiguration, error) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	id := pipelineID.Hex()
	pipeline, exists := m.pipelines[id]
	if !exists {
		return nil, mongo.ErrNoDocuments
	}

	return &pipeline, nil
}

func (m *MockMongoService) ListPipelines(ctx context.Context, filter bson.M) ([]models.PipelineConfiguration, error) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	var pipelines []models.PipelineConfiguration
	for _, pipeline := range m.pipelines {
		if matchesPipelineFilter(pipeline, filter) {
			pipelines = append(pipelines, pipeline)
		}
	}
	return pipelines, nil
}

// Helper function for matching a pipeline against a filter
func matchesPipelineFilter(pipeline models.PipelineConfiguration, filter bson.M) bool {
	// Check if filter contains 'EventID'
	if eventIDFilter, ok := filter["EventID"]; ok {
		// Compare the pipeline's EventID with the filter's EventID
		return pipeline.EventID == eventIDFilter
	}

	// TODO: probably will cause silly errors for unit tests
	// If the filter does not contain 'EventID', consider it a match.
	// You can modify this behavior based on your requirements.
	return true
}

func (m *MockMongoService) DeletePipeline(ctx context.Context, pipelineID primitive.ObjectID) (*mongo.DeleteResult, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	id := pipelineID.Hex()
	if _, exists := m.pipelines[id]; !exists {
		return nil, mongo.ErrNoDocuments
	}

	delete(m.pipelines, id)
	return &mongo.DeleteResult{DeletedCount: 1}, nil
}

func (m *MockMongoService) ListForms(ctx context.Context, filter bson.M) ([]models.FormStructure, error) {
	// TODO: implement
	return nil, nil
}

func (m *MockMongoService) CreateResponse(ctx context.Context, submission models.FormResponse) (*mongo.InsertOneResult, error) {
	return nil, nil
}

func (m *MockMongoService) ListResponses(ctx context.Context, filter bson.M) ([]models.FormResponse, error) {
	return nil, nil
}

func (m *MockMongoService) UpdateResponse(ctx context.Context, submission models.FormResponse, submissionID primitive.ObjectID) (*mongo.UpdateResult, error) {
	return nil, nil
}

func (m *MockMongoService) DeleteResponse(ctx context.Context, submissionID primitive.ObjectID) (*mongo.DeleteResult, error) {
	return nil, nil
}

func (m *MockMongoService) CreatePipelineRun(ctx context.Context, run models.PipelineRun) (*mongo.InsertOneResult, error) {
	return nil, nil
}

func (m *MockMongoService) ListPipelineRuns(ctx context.Context, filter bson.M) ([]models.PipelineRun, error) {
	return nil, nil
}

func (m *MockMongoService) UpdatePipelineRun(ctx context.Context, run models.PipelineRun, runID primitive.ObjectID) (*mongo.UpdateResult, error) {
	return nil, nil
}

func (m *MockMongoService) DeletePipelineRun(ctx context.Context, runID primitive.ObjectID) (*mongo.DeleteResult, error) {
	return nil, nil
}

func (m *MockMongoService) CreateEmailTemplate(ctx context.Context, template models.EmailTemplate) (*mongo.InsertOneResult, error) {
	return nil, nil
}

func (m *MockMongoService) GetEmailTemplate(ctx context.Context, templateID primitive.ObjectID) (*models.EmailTemplate, error) {
	return nil, nil
}

func (m *MockMongoService) UpdateEmailTemplate(ctx context.Context, template models.EmailTemplate, templateID primitive.ObjectID) (*mongo.UpdateResult, error) {
	return nil, nil
}

func (m *MockMongoService) DeleteEmailTemplate(ctx context.Context, templateID primitive.ObjectID) (*mongo.DeleteResult, error) {
	return nil, nil
}

func (m *MockMongoService) ListEmailTemplates(ctx context.Context, filter bson.M) ([]models.EmailTemplate, error) {
	return nil, nil
}
