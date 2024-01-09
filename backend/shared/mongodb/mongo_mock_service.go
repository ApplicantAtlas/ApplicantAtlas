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
	// todo
	return nil, nil
}

func (m *MockMongoService) UpdatePipeline(ctx context.Context, pipeline models.PipelineConfiguration, pipelineID primitive.ObjectID) (*mongo.UpdateResult, error) {
	// todo
	return nil, nil
}

func (m *MockMongoService) GetPipeline(ctx context.Context, pipelineID primitive.ObjectID) (*models.PipelineConfiguration, error) {
	// todo
	return nil, nil
}

func (m *MockMongoService) ListEventPipelines(ctx context.Context, filter bson.M) ([]models.PipelineConfiguration, error) {
	// todo
	return nil, nil
}

func (m *MockMongoService) DeletePipeline(ctx context.Context, pipelineID primitive.ObjectID) (*mongo.DeleteResult, error) {
	return nil, nil
}
