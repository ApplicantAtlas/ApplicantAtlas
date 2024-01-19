package emails

import (
	"api/internal/middlewares"
	"api/internal/types"
	"net/http"
	"shared/models"
	"shared/mongodb"
	"shared/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RegisterEmailTemplateRoutes(r *gin.RouterGroup, params *types.RouteParams) {
	r.GET(":template_id", middlewares.JWTAuthMiddleware(), getEmailTemplate(params))
	r.POST("", middlewares.JWTAuthMiddleware(), createNewTemplate(params))
	r.PUT(":template_id", middlewares.JWTAuthMiddleware(), updateTemplate(params))
	r.DELETE(":template_id", middlewares.JWTAuthMiddleware(), deleteTemplate(params))
}

func getEmailTemplate(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		templateID, err := primitive.ObjectIDFromHex(c.Param("template_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid pipeline ID",
			})
			return
		}

		template, err := params.MongoService.GetEmailTemplate(c, templateID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error getting pipeline",
			})
			return
		}

		if !mongodb.CanUserModifyEmailTemplate(c, params.MongoService, authenticatedUser, templateID, template) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})
			return
		}

		c.JSON(http.StatusOK, template)
	}
}

func createNewTemplate(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		var template models.EmailTemplate
		if err := c.ShouldBindJSON(&template); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request body",
			})
			return
		}

		if !mongodb.CanUserModifyEvent(c, params.MongoService, authenticatedUser, template.EventID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})
			return
		}

		templateID, err := params.MongoService.CreateEmailTemplate(c, template)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating email template"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"id": templateID})
	}
}

func updateTemplate(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		templateID, err := primitive.ObjectIDFromHex(c.Param("template_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pipeline ID"})
			return
		}

		var req models.EmailTemplate
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !mongodb.CanUserModifyEmailTemplate(c, params.MongoService, authenticatedUser, templateID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to update this pipeline"})
			return
		}

		_, err = params.MongoService.UpdateEmailTemplate(c, req, templateID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update pipeline configuration"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Pipeline configuration updated successfully"})
	}
}

func deleteTemplate(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		templateID, err := primitive.ObjectIDFromHex(c.Param("template_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pipeline ID"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !mongodb.CanUserModifyEmailTemplate(c, params.MongoService, authenticatedUser, templateID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to delete this pipeline"})
			return
		}

		_, err = params.MongoService.DeleteEmailTemplate(c, templateID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete pipeline"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Pipeline deleted successfully"})
	}
}
