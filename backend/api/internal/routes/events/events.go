package events

import (
	"api/internal/middlewares"
	"api/internal/routes/events/secrets"
	"api/internal/types"
	"fmt"
	"log"
	"net/http"
	"shared/messages"
	"shared/models"
	"shared/mongodb"
	"shared/utils"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RegisterRoutes sets up the routes for event management
func RegisterRoutes(r *gin.RouterGroup, params *types.RouteParams) {
	r.GET("", listEventsHandler(params))
	r.POST("", middlewares.JWTAuthMiddleware(), createEventHandler(params))
	r.GET("my-events", middlewares.JWTAuthMiddleware(), listMyEventsHandler(params))
	r.PUT(":event_id", middlewares.JWTAuthMiddleware(), updateEventHandler(params))
	r.DELETE(":event_id", middlewares.JWTAuthMiddleware(), deleteEventHandler(params))
	r.GET(":event_id", getEventHandler(params))
	r.GET(":event_id/forms", middlewares.JWTAuthMiddleware(), getEventFormsHandler(params))
	r.GET(":event_id/pipelines", middlewares.JWTAuthMiddleware(), getEventPipelinesHandler(params))
	r.GET(":event_id/email_templates", middlewares.JWTAuthMiddleware(), getEventEmailTemplatesHandler(params))
	r.POST(":event_id/organizers/:user_email", middlewares.JWTAuthMiddleware(), addOrganizerHandler(params))
	r.DELETE(":event_id/organizers/:user_id", middlewares.JWTAuthMiddleware(), removeOrganizerHandler(params))

	// Register the secrets routes
	secrets.RegisterRoutes(r.Group(":event_id/secrets"), params)
}

func listEventsHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		/*
			TODO:
			* Pagination
			* Filtering by date
			* Filtering by address
			* Sort by date desc
			* Only for visible events
			* We need to ensure certain fields dropped if admin or not like on the get method
		*/
		events, err := params.MongoService.ListEventsMetadata(c, nil)
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

func createEventHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req createEventRequest
		if err := utils.BindJSON(c, &req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if errors := utils.ValidateStruct(utils.Validator, req); len(errors) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": strings.Join(errors, "\n")})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		// Ensure user id exists
		if authenticatedUser.ID == primitive.NilObjectID {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
			return
		}

		lastUpdatedAt := time.Now()
		event := models.Event{
			Metadata: models.EventMetadata{
				Name:          req.Name,
				LastUpdatedAt: lastUpdatedAt,
			},
			OrganizerIDs: []primitive.ObjectID{authenticatedUser.ID},
			CreatedByID:  authenticatedUser.ID,
		}

		// Check billing
		u, err := params.MongoService.GetUserDetails(c, authenticatedUser.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
			return
		}

		if u.CurrentSubscriptionID == primitive.NilObjectID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User does not have a subscription"})
			return
		}

		sub, err := params.MongoService.GetSubscription(c, u.CurrentSubscriptionID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get subscription"})
			return
		}

		if sub.Status != models.SubscriptionStatusActive {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User subscription is not active"})
			return
		}

		_, err = params.MongoService.IncrementSubscriptionUtilization(c, sub.ID, "eventsCreated", "maxEvents")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Event creation limit reached, please upgrade your subscription"})
			return
		}

		// Insert the new event into the database
		rec, err := params.MongoService.CreateEvent(c, event)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Event created successfully", "id": rec.InsertedID})
	}
}

type updateEventMetadataRequest struct {
	Metadata models.EventMetadata `json:"metadata" validate:"required"`
}

func updateEventHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		eventID := c.Param("event_id")
		var req updateEventMetadataRequest
		if err := utils.BindJSON(c, &req); err != nil {
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

		// Pull the current event from the database to compare the last updated time
		event, err := params.MongoService.GetEvent(c, objID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get event"})
			return
		}

		if event.Metadata.LastUpdatedAt.After(req.Metadata.LastUpdatedAt) {
			c.JSON(http.StatusBadRequest, gin.H{"error": messages.UpdateAttemptOnChangedEntity})
			return
		}

		// Update the event
		newLastUpdatedAt := time.Now()
		req.Metadata.LastUpdatedAt = newLastUpdatedAt
		_, err = params.MongoService.UpdateEventMetadata(c, objID, req.Metadata)
		if err != nil {
			if err == mongodb.ErrUserNotAuthenticated {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User not an organizer of this event"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Event updated successfully", "lastUpdatedAt": newLastUpdatedAt})
	}
}

func listMyEventsHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		// Ensure user id exists
		if authenticatedUser.ID == primitive.NilObjectID {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
			return
		}

		// List all events where the user is an organizer
		events, err := params.MongoService.ListEventsMetadata(c, bson.M{"organizerIDs": authenticatedUser.ID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list events"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"events": events})
	}
}

func deleteEventHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		eventID := c.Param("event_id")

		// Convert eventID to ObjectID
		objID, err := primitive.ObjectIDFromHex(eventID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		_, err = params.MongoService.DeleteEvent(c, objID)
		if err != nil {
			if err == mongodb.ErrUserNotAuthenticated {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User not an organizer of this event"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete event"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
	}
}

func getEventHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		eventID := c.Param("event_id")

		// Convert eventID to ObjectID
		objID, err := primitive.ObjectIDFromHex(eventID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		event, err := params.MongoService.GetEvent(c, objID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get event"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"event": event})
	}
}

func getEventFormsHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		eventParam := c.Param("event_id")
		eventID, err := primitive.ObjectIDFromHex(eventParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !mongodb.CanUserModifyEvent(c, params.MongoService, authenticatedUser, eventID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not allowed to modify this event"})
			return
		}

		forms, err := params.MongoService.ListForms(c, bson.M{"eventID": eventID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving event forms"})
			fmt.Println(err)
			return
		}

		c.JSON(http.StatusOK, gin.H{"forms": forms})
	}
}

func getEventPipelinesHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		eventParam := c.Param("event_id")
		eventID, err := primitive.ObjectIDFromHex(eventParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !mongodb.CanUserModifyEvent(c, params.MongoService, authenticatedUser, eventID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not allowed to modify this event"})
			return
		}

		pipelines, err := params.MongoService.ListPipelines(c, bson.M{"eventID": eventID})
		if err != nil {
			log.Printf("Error retrieving event pipelines: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving event pipelines"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"pipelines": pipelines})
	}
}

func getEventEmailTemplatesHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		eventParam := c.Param("event_id")
		eventID, err := primitive.ObjectIDFromHex(eventParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !mongodb.CanUserModifyEvent(c, params.MongoService, authenticatedUser, eventID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not allowed to modify this event"})
			return
		}

		emailTemplates, err := params.MongoService.ListEmailTemplates(c, bson.M{"eventID": eventID})
		if err != nil {
			log.Printf("Error retrieving event email templates: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving event email templates"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"email_templates": emailTemplates})
	}
}

// Add organizer to event
func addOrganizerHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		eventID := c.Param("event_id")
		userEmail := c.Param("user_email")

		// Convert eventID to ObjectID
		objID, err := primitive.ObjectIDFromHex(eventID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !mongodb.CanUserModifyEvent(c, params.MongoService, authenticatedUser, objID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not allowed to modify this event"})
			return
		}

		// Get user by email
		user, err := params.MongoService.FindUserByEmail(c, userEmail)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find a user with that email"})
			return
		}

		if user == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User not found, please ensure that user has an account"})
			return
		}

		_, err = params.MongoService.AddOrganizerToEvent(c, objID, user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add organizer to event"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"userID": user.ID, "message": "Organizer added to event successfully"})
	}
}

// Remove organizer from event
func removeOrganizerHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		eventID := c.Param("event_id")
		userID := c.Param("user_id")

		// Convert eventID to ObjectID
		objID, err := primitive.ObjectIDFromHex(eventID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !mongodb.CanUserModifyEvent(c, params.MongoService, authenticatedUser, objID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not allowed to modify this event"})
			return
		}

		// Convert userID to ObjectID
		userObjID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Get the event to make sure there are still > 1 organizers
		event, err := params.MongoService.GetEvent(c, objID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get event"})
			return
		}

		if event.CreatedByID == userObjID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot remove the creator of the event as an admin, you must delete the event instead"})
			return
		}

		if len(event.OrganizerIDs) <= 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot remove the last organizer from an event, you must delete the event instead"})
			return
		}

		_, err = params.MongoService.RemoveOrganizerFromEvent(c, objID, userObjID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove organizer from event"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Organizer removed from event successfully"})
	}
}
