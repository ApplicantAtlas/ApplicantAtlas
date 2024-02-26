package secrets

import (
	"api/internal/middlewares"
	"api/internal/types"
	"net/http"
	"shared/models"
	"shared/mongodb"
	"shared/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

/*
Secret API Operations:
- Update secret
- Delete secret
- List secrets (w/o secret values)

*/

func RegisterRoutes(r *gin.RouterGroup, params *types.RouteParams) {
	r.GET("", middlewares.JWTAuthMiddleware(), listSecrets(params))
	r.POST("", middlewares.JWTAuthMiddleware(), createSecret(params))
	r.PUT(":secret_id", middlewares.JWTAuthMiddleware(), updateSecret(params))
	r.DELETE(":secret_id", middlewares.JWTAuthMiddleware(), deleteSecret(params))
}

func listSecrets(params *types.RouteParams) gin.HandlerFunc {
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

		eventID, err := primitive.ObjectIDFromHex(c.Param("event_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		if !mongodb.CanUserModifyEvent(c, params.MongoService, authenticatedUser, eventID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not an organizer of this event"})
			return
		}

		// List all secrets for the event
		secrets, err := params.MongoService.ListEventSecretConfigurations(c, bson.M{"eventID": eventID}, true)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list secrets"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"secrets": secrets})
	}
}

func createSecret(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		eventID, err := primitive.ObjectIDFromHex(c.Param("event_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		if !mongodb.CanUserModifyEvent(c, params.MongoService, authUser, eventID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not an organizer of this event"})
			return
		}

		// Parse Request Body
		var newSecret models.EventSecret
		if err := c.BindJSON(&newSecret); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		_, err = params.MongoService.CreateEventSecret(c, eventID, newSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create secret"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Secret created successfully"})
	}
}

func updateSecret(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Authenticate and validate user
		authUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		eventID, err := primitive.ObjectIDFromHex(c.Param("event_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		secretID, err := primitive.ObjectIDFromHex(c.Param("secret_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid secret ID"})
			return
		}

		// Parse Request Body
		var updatedSecret models.EventSecret
		if err := c.BindJSON(&updatedSecret); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		if !mongodb.CanUserModifyEvent(c, params.MongoService, authUser, eventID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not an organizer of this event"})
			return
		}

		if secretID != updatedSecret.ID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Secret ID in URL does not match secret ID in request body"})
			return
		}

		// Update the secret in the database
		_, err = params.MongoService.UpdateEventSecret(c, eventID, updatedSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update secret"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Secret updated successfully"})
	}
}

func deleteSecret(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		eventID, err := primitive.ObjectIDFromHex(c.Param("event_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		secretID, err := primitive.ObjectIDFromHex(c.Param("secret_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid secret ID"})
			return
		}

		if !mongodb.CanUserModifyEvent(c, params.MongoService, authUser, eventID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not an organizer of this event"})
			return
		}

		// Delete the secret from the database
		err = params.MongoService.DeleteEventSecret(c, eventID, secretID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete secret"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Secret deleted successfully"})
	}
}
