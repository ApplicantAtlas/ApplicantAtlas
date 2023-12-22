package events

import (
	"api/internal/middlewares"
	"api/internal/models"
	"api/internal/mongodb"
	"api/internal/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RegisterRoutes sets up the routes for event management
func RegisterRoutes(r *gin.RouterGroup, mongoService mongodb.MongoService) {
	r.GET("/", listEventsHandler(mongoService))
	r.POST("/", middlewares.JWTAuthMiddleware(), createEventHandler(mongoService))
	r.PUT("/:event_id", middlewares.JWTAuthMiddleware(), updateEventHandler(mongoService))
}

func listEventsHandler(mongoService mongodb.MongoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		/*
			TODO:
			* Pagination
			* Filtering by date
			* Filtering by address
			* Sort by date desc
			* Only for visible events
		*/
		events, err := mongoService.ListEventsMetadata(c, nil)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list events"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"events": events})
	}
}

type createEventRequest struct {
	Name string `json:"name" validate:"required"`
}

func createEventHandler(mongoService mongodb.MongoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req createEventRequest
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if errors := utils.ValidateStruct(utils.Validator, req); len(errors) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": strings.Join(errors, "\n")})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c)
		if !ok {
			return
		}

		// Ensure user id exists
		if authenticatedUser.ID == primitive.NilObjectID {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
			return
		}

		event := models.Event{
			Metadata: models.EventMetadata{
				Name: req.Name,
			},
			OrganizerIDs: []primitive.ObjectID{authenticatedUser.ID},
		}

		// Insert the new event into the database
		mongoService.CreateEvent(c, event)

		c.JSON(http.StatusOK, gin.H{"message": "Event created successfully"})
	}
}

type updateEventMetadataRequest struct {
	Metadata models.EventMetadata `json:"metadata" validate:"required"`
}

func updateEventHandler(mongoService mongodb.MongoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		eventID := c.Param("event_id")
		var req updateEventMetadataRequest
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if errors := utils.ValidateStruct(utils.Validator, req); len(errors) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": strings.Join(errors, "\n")})
			return
		}

		// Convert eventID to ObjectID
		objID, err := primitive.ObjectIDFromHex(eventID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		// Update the event
		_, err = mongoService.UpdateEventMetadata(c, objID, req.Metadata)
		if err != nil {
			if err == mongodb.ErrUserNotAuthenticated {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User not an organizer of this event"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Event updated successfully"})
	}
}
