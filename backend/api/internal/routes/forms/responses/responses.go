package responses

import (
	"api/internal/helpers"
	"api/internal/middlewares"
	"api/internal/types"
	"net/http"
	"shared/models"
	"shared/mongodb"
	"shared/utils"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RegisterFormResponsesRoutes(r *gin.RouterGroup, params *types.RouteParams) {
	r.POST("", middlewares.JWTAuthMiddleware(), submitFormHandler(params))
	r.GET("", middlewares.JWTAuthMiddleware(), listFormResponsesHandler(params))
}

func submitFormHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		var formData map[string]interface{}
		if err := utils.BindJSON(c, &formData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		formID, err := primitive.ObjectIDFromHex(c.Param("form_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form ID"})
			return
		}

		req := models.FormResponse{
			FormID:    formID,
			Data:      formData,
			CreatedAt: time.Now(),
		}
		if errors := utils.ValidateStruct(utils.Validator, req); len(errors) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": strings.Join(errors, "\n")})
			return
		}

		form, err := params.MongoService.GetForm(c, formID)
		if err != nil && form != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Form does not exist"})
			return
		}

		if form.Status != "published" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Form is not published, if you believe this is an error message the event admins"})
			return
		}

		if !form.CloseSubmissionsAt.IsZero() && form.CloseSubmissionsAt.Before(time.Now()) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Form submissions are closed"})
			return
		}

		if !form.OpenSubmissionsAt.IsZero() && form.OpenSubmissionsAt.After(time.Now()) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Form submissions are not open yet"})
			return
		}

		// Check if form has reached max submissions
		var submissions []models.FormResponse
		if form.MaxSubmissions > 0 {
			submissions, err = params.MongoService.ListResponses(c, bson.M{"formID": formID})
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
				return
			}

			if len(submissions) >= form.MaxSubmissions {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Form has reached maximum number of submissions"})
				return
			}
		}

		if !form.AllowMultipleSubmissions {
			if submissions == nil {
				submissions, err = params.MongoService.ListResponses(c, bson.M{"formID": formID, "userID": authenticatedUser.ID})
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
					return
				}
			}

			// TODO: Test efficiency of this vs just potentially re-querying the database
			// my guess is this is more efficient if both max and allow multiple submissions are false
			// because probably less than 1000 submissions per form
			for _, submission := range submissions {
				if submission.UserID == authenticatedUser.ID {
					c.JSON(http.StatusBadRequest, gin.H{"error": "You have already submitted this form"})
					return
				}
			}
		}

		// TODO: restrict to users who have access

		// Submit form
		req.UserID = authenticatedUser.ID
		if _, err := params.MongoService.CreateResponse(c, req); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}

		// Check pipeline
		pipelines, err := params.MongoService.ListPipelines(c, bson.M{"eventID": form.EventID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}

		for _, pipeline := range pipelines {
			if pipeline.Event.EventType() == "FormSubmission" {
				err := helpers.TriggerPipeline(c, params.KafkaProducer, params.MongoService, pipeline, req.Data)

				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
					return
				}
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	}
}

func listFormResponsesHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		formID, err := primitive.ObjectIDFromHex(c.Param("form_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form ID"})
			return
		}

		form, err := params.MongoService.GetForm(c, formID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Form does not exist"})
			return
		}

		if !mongodb.CanUserModifyForm(c, params.MongoService, authenticatedUser, form.ID, form) {
			c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to access this form"})
			return
		}

		responses, err := params.MongoService.ListResponses(c, bson.M{"formID": formID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"form": form, "responses": responses})
	}
}
