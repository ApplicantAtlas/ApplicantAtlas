// events/events_test.go
package events

import (
	"api/internal/types"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"shared/models"
	"shared/mongodb"
	"shared/utils"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestEventsHandlers(t *testing.T) {
	// Initialize the mock service
	mockMongoService := mongodb.NewMockMongoService()

	// Create a gin router with the events routes
	r := gin.Default()
	rg := r.Group("/events")

	params := types.RouteParams{
		MongoService: mockMongoService,
	}

	RegisterRoutes(rg, &params)

	// Set up common data
	eventID := primitive.NewObjectID()
	user := models.User{
		ID:        primitive.NewObjectID(),
		FirstName: "Alice",
		LastName:  "Smith",
		Email:     "alice@example.com",
	}

	// Generate JWT
	token, err := utils.GenerateJWT(&user)
	if err != nil {
		t.Fatal(err)
	}

	event := models.Event{
		ID: eventID,
		Metadata: models.EventMetadata{
			Name: "Sample Event",
		},
		OrganizerIDs: []primitive.ObjectID{user.ID},
	}

	// Mock the user context middleware to simulate an authenticated user
	r.Use(func(c *gin.Context) {
		c.Set("user", &user)
		c.Next()
	})

	// Test list events
	t.Run("list events", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/events", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	// Test create event
	t.Run("create event", func(t *testing.T) {
		reqBody, _ := json.Marshal(map[string]string{
			"name": event.Metadata.Name,
		})
		req, _ := http.NewRequest(http.MethodPost, "/events", bytes.NewReader(reqBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	// Test get event
	t.Run("get event", func(t *testing.T) {
		// create event
		reqBody, _ := json.Marshal(map[string]string{
			"name": event.Metadata.Name,
		})
		req, _ := http.NewRequest(http.MethodPost, "/events", bytes.NewReader(reqBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		// Get response body
		var response struct {
			ID string `json:"id"`
		}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		if err != nil {
			t.Fatal(err)
		}

		// Get event
		req, _ = http.NewRequest(http.MethodGet, "/events/"+response.ID, nil)
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})
}
