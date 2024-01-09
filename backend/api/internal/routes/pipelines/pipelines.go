// TODO: Clean this up, I wrote this code while a little annoyed and tired
package pipelines

import (
	"api/internal/middlewares"
	"api/internal/types"
	"net/http"
	"shared/models"
	"shared/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RegisterRoutes(r *gin.RouterGroup, params *types.RouteParams) {
	r.GET(":pipeline_id", middlewares.JWTAuthMiddleware(), getPipelineConfigHandler(params))
	r.POST("", middlewares.JWTAuthMiddleware(), createPipelineConfigHandler(params))
	r.PUT(":pipeline_id", middlewares.JWTAuthMiddleware(), updatePipelineConfigHandler(params))
	r.DELETE(":pipeline_id", middlewares.JWTAuthMiddleware(), deletePipelineConfigHandler(params))
}

func getPipelineConfigHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		pipelineID, err := primitive.ObjectIDFromHex(c.Param("pipeline_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pipeline ID"})
			return
		}

		pipelineConfig, err := params.MongoService.GetPipeline(c, pipelineID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pipeline configuration not found"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !isUserAuthorizedToUpdatePipeline(c, authenticatedUser, pipelineConfig.ID, params) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to view this pipeline"})
			return
		}

		c.JSON(http.StatusOK, pipelineConfig)
	}
}

func createPipelineConfigHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.PipelineConfiguration
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		// Make sure the user is an admin of pipeline.EventID
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		eventID, err := primitive.ObjectIDFromHex(req.EventID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}
		event, err := params.MongoService.GetEvent(c, eventID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}

		var found = false
		for _, organizerID := range event.OrganizerIDs {
			if organizerID == authenticatedUser.ID {
				found = true
				break
			}
		}

		if !found {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to create a pipeline for this event"})
			return
		}

		pipelineID, err := params.MongoService.CreatePipeline(c, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create pipeline configuration"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"id": pipelineID})
	}
}

// update_pipeline_config_handler.go

func updatePipelineConfigHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		pipelineID, err := primitive.ObjectIDFromHex(c.Param("pipeline_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pipeline ID"})
			return
		}

		var req models.PipelineConfiguration
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !isUserAuthorizedToUpdatePipeline(c, authenticatedUser, pipelineID, params) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to update this pipeline"})
			return
		}

		_, err = params.MongoService.UpdatePipeline(c, req, pipelineID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update pipeline configuration"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Pipeline configuration updated successfully"})
	}
}

// delete_pipeline_config_handler.go

func deletePipelineConfigHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		pipelineID, err := primitive.ObjectIDFromHex(c.Param("pipeline_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pipeline ID"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !isUserAuthorizedToUpdatePipeline(c, authenticatedUser, pipelineID, params) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to delete this pipeline"})
			return
		}

		_, err = params.MongoService.DeletePipeline(c, pipelineID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete pipeline configuration"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Pipeline configuration deleted successfully"})
	}
}

// helpers

// TODO: this isn't super efficient since some functions are called multipel times through this
// if we abstracted this out to shared functionality and made it more modular we could make it more eff.
func isUserAuthorizedToUpdatePipeline(c *gin.Context, user *models.User, pipelineID primitive.ObjectID, params *types.RouteParams) bool {
	if user == nil {
		return false
	}

	if user.ID == primitive.NilObjectID {
		return false
	}

	pipelineConfig, err := params.MongoService.GetPipeline(c, pipelineID)
	if err != nil {
		return false
	}

	eventID, err := primitive.ObjectIDFromHex(pipelineConfig.EventID)
	if err != nil {
		return false
	}

	event, err := params.MongoService.GetEvent(c, eventID)
	if err != nil {
		return false
	}

	for _, organizerID := range event.OrganizerIDs {
		if organizerID == user.ID {
			return true
		}
	}

	return false
}
