package responses

import (
	"api/internal/helpers"
	"api/internal/middlewares"
	"api/internal/types"
	"encoding/csv"
	"fmt"
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
	r.GET("csv", middlewares.JWTAuthMiddleware(), downloadFormResponsesAsCSVHandler(params))
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

		// TODO: We should do this in a transaction
		// Check pipeline
		pipelines, err := params.MongoService.ListPipelines(c, bson.M{"eventID": form.EventID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}

		for _, pipeline := range pipelines {
			if pipeline.Event.Type == "FormSubmission" {
				err := helpers.TriggerPipeline(c, params.KafkaProducer, params.MongoService, pipeline, req.Data)

				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
					return
				}
			}
		}

		// Submit form
		req.UserID = authenticatedUser.ID
		if _, err := params.MongoService.CreateResponse(c, req); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	}
}

func processResponses(form *models.FormStructure, responses *[]models.FormResponse) ([]map[string]interface{}, []string) {
	var processedResponses []map[string]interface{}

	// Define the order of columns
	columnOrder := []string{"Response ID", "User ID", "Submitted At"}
	for _, attr := range form.Attrs {
		columnOrder = append(columnOrder, attr.Question+"_attr_key:"+attr.Key)
	}

	// Create header row based on column order
	headerRow := make(map[string]interface{})
	for _, col := range columnOrder {
		headerRow[col] = col
	}
	processedResponses = append(processedResponses, headerRow)

	// Process each response
	for _, response := range *responses {
		processedResponse := make(map[string]interface{})
		processedResponse["Response ID"] = response.ID.Hex()
		processedResponse["User ID"] = response.UserID.Hex()
		processedResponse["Submitted At"] = response.CreatedAt.Format(time.RFC3339)

		// Add other attributes
		for _, attr := range form.Attrs {
			uniqueKey := attr.Question + "_attr_key:" + attr.Key
			value, exists := response.Data[attr.Key]
			if exists {
				processedResponse[uniqueKey] = value
			} else {
				processedResponse[uniqueKey] = ""
			}
		}

		processedResponses = append(processedResponses, processedResponse)
	}

	return processedResponses, columnOrder
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

		processedResponses, columnOrder := processResponses(form, &responses)

		c.JSON(http.StatusOK, gin.H{"responses": processedResponses, "columnOrder": columnOrder})
	}
}

func downloadFormResponsesAsCSVHandler(params *types.RouteParams) gin.HandlerFunc {
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

		// Fetch form and responses similar to your existing logic
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
		processedResponses, columnOrder := processResponses(form, &responses)

		c.Writer.Header().Set("Content-Type", "text/csv")
		c.Writer.Header().Set("Content-Disposition", "attachment;filename=form_responses.csv")
		writer := csv.NewWriter(c.Writer)

		// Write data rows
		for _, processedResponse := range processedResponses {
			var row []string
			for _, col := range columnOrder {
				value, ok := processedResponse[col]
				if !ok {
					row = append(row, "")
				} else {
					row = append(row, fmt.Sprintf("%v", value))
				}
			}
			writer.Write(row)
		}

		writer.Flush()
	}
}
