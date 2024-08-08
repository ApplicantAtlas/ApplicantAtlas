package responses

import (
	"api/internal/helpers"
	"api/internal/middlewares"
	"api/internal/types"
	"encoding/csv"
	"fmt"
	"net/http"
	"shared/kafka"
	"shared/logger"
	"shared/messages"
	"shared/models"
	"shared/mongodb"
	"shared/utils"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/writeconcern"
)

func RegisterFormResponsesRoutes(r *gin.RouterGroup, params *types.RouteParams) {
	r.POST("", middlewares.JWTAuthMiddleware(), submitFormHandler(params))
	r.GET("", middlewares.JWTAuthMiddleware(), listFormResponsesHandler(params))
	r.GET("csv", middlewares.JWTAuthMiddleware(), downloadFormResponsesAsCSVHandler(params))

	r.PUT(":response_id", middlewares.JWTAuthMiddleware(), updateFormResponseHandler(params))
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
			FormID:        formID,
			Data:          formData,
			CreatedAt:     time.Now(),
			LastUpdatedAt: time.Now(),
		}
		if errors := utils.ValidateStruct(utils.Validator, req); len(errors) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": strings.Join(errors, "\n")})
			return
		}

		form, err := params.MongoService.GetForm(c, formID, false)
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
			submissions, err = params.MongoService.ListResponses(c, bson.M{"formID": formID}, nil)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
				logger.Error("Failed to list form responses", err)
				return
			}

			if len(submissions) >= form.MaxSubmissions {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Form has reached maximum number of submissions"})
				return
			}
		}

		if !form.AllowMultipleSubmissions {
			if submissions == nil {
				submissions, err = params.MongoService.ListResponses(c, bson.M{"formID": formID, "userID": authenticatedUser.ID}, nil)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
					logger.Error("Failed to list form responses for duplicate submission check", err)
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

		// If the form is restricted, check if the user is in the whitelist
		if form.IsRestricted {
			allowed, restrictMessage := mongodb.IsUserEmailInWhitelist(c, form.AllowedSubmitters)
			if !allowed {
				c.JSON(http.StatusUnauthorized, gin.H{"error": restrictMessage})
				return
			}
		}

		// Build map of field id to field
		fieldMap := make(map[string]models.FormField)
		for _, field := range form.Attrs {
			fieldMap[field.Key] = field
		}

		// Validate form data itself and the additional validators on it and such
		for key, value := range formData {
			field := fieldMap[key]
			if field.Key == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid field key, form may have just changed"})
			}

			err = ValidateResponse(value, field)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
		}

		// Validate required fields again, to cover the case of the data doesnt even have that key
		for _, field := range form.Attrs {
			if field.Required {
				if _, exists := formData[field.Key]; !exists {
					c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("field %s is required", field.Question)})
					return
				}
			}
		}

		// TODO: We should do this in a transaction

		// Check billing
		
		wc := writeconcern.Majority()
		txnOptions := options.Transaction().SetWriteConcern(wc)
		client := params.MongoService.GetClient()

		eventDetails, err := params.MongoService.GetEvent(c, form.EventID)
		_ = eventDetails
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			logger.Error("Failed to get event details", err)
			return
		}

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

		// Check pipeline
		pipelines, err := params.MongoService.ListPipelines(c, bson.M{"eventID": form.EventID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			logger.Error("Failed to list pipelines for this event", err)
			return
		}

		for _, pipeline := range pipelines {
			if pipeline.Event.Type == "FormSubmission" {
				// Sanity check
				if pipeline.Event.FormSubmission.OnFormID != formID {
					continue
				}

				session, err := client.StartSession()
				if err != nil {
					panic(err)
				}
				defer session.EndSession(c)

				_, err = session.WithTransaction(c, func(ctx mongo.SessionContext) (interface{}, error) {
					result, err := params.MongoService.IncrementSubscriptionUtilization(ctx, sub.ID, "pipelineRuns", "maxMonthlyPipelineRuns")
					return result, err
				}, txnOptions)

				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Pipeline limit reached, please contact the event admin to upgrade their plan."})
					// TODO: send out email to admin
					return
				}

				err = helpers.TriggerPipeline(c, params.MessageProducer, params.MongoService, pipeline, req.Data)

				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
					logger.Error("Failed to trigger pipeline", err)
					return
				}
			}
		}

		session, err := client.StartSession()
		if err != nil {
			panic(err)
		}
		defer session.EndSession(c)
		result, err := session.WithTransaction(c, func(ctx mongo.SessionContext) (interface{}, error) {
			result, err := params.MongoService.IncrementSubscriptionUtilization(ctx, sub.ID, "pipelineRuns", "maxMonthlyPipelineRuns")
			return result, err
		}, txnOptions)
		_ = result 

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Event submission limit reached, please contact the event admin to upgrade their plan."})
			return
		}

		// Submit form
		session_response, err_response:= client.StartSession()
		if err_response != nil {
			panic(err_response)
		}

		defer session_response.EndSession(c)

		result_response, err_response := session.WithTransaction(c, func(ctx mongo.SessionContext) (interface{}, error) {
			req.UserID = authenticatedUser.ID
			result , err := params.MongoService.CreateResponse(ctx, req)
			return result, err
		}, txnOptions)
		_ = result_response 

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			logger.Error("Failed to create form response", err)
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	}
}

func processResponses(form *models.FormStructure, responses *[]models.FormResponse, getDeletedColumnData bool) ([]map[string]interface{}, []string) {
	var processedResponses []map[string]interface{}

	// Define the order of columns
	columnOrder := []string{"Response ID", "User ID", "Submitted At", "Last Updated At"}
	defaultColumnNum := len(columnOrder)
	colKeyMap := make(map[string]struct{})
	for _, attr := range form.Attrs {
		columnOrder = append(columnOrder, attr.Question+"_attr_key:"+attr.Key)
		colKeyMap[attr.Key] = struct{}{}
	}

	if getDeletedColumnData {
		// Go through all responses and add any deleted column data to the column order
		for _, response := range *responses {
			for key := range response.Data {
				if _, exists := colKeyMap[key]; !exists {
					// Add column
					newColumn := fmt.Sprintf("deleted column_attr_key:%s", key)
					columnOrder = append(columnOrder, newColumn)
					colKeyMap[key] = struct{}{}
				}
			}
		}
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
		processedResponse["Submitted At"] = response.CreatedAt
		processedResponse["Last Updated At"] = response.LastUpdatedAt

		// Add other attributes
		for _, fullKeyName := range columnOrder[defaultColumnNum:] {
			split := strings.Split(fullKeyName, "_attr_key:")
			uniqueKey := split[len(split)-1]

			value, exists := response.Data[uniqueKey]
			if exists {
				processedResponse[fullKeyName] = value
			} else {
				processedResponse[fullKeyName] = ""
			}
		}

		processedResponses = append(processedResponses, processedResponse)
	}

	return processedResponses, columnOrder
}

func listFormResponsesHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		getDeletedColumnData := c.DefaultQuery("getDeletedColumnData", "false")
		getDeletedColumnDataBool := (getDeletedColumnData == "true")

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		formID, err := primitive.ObjectIDFromHex(c.Param("form_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form ID"})
			return
		}

		form, err := params.MongoService.GetForm(c, formID, true)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Form does not exist"})
			return
		}

		if !mongodb.CanUserModifyForm(c, params.MongoService, authenticatedUser, form.ID, form) {
			c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to access this form"})
			return
		}

		// Pagination parameters
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

		// Validate page and pageSize
		if page < 1 {
			page = 1
		}
		if pageSize < 1 || pageSize > 100 {
			pageSize = 10
		}

		// Pagination options
		skip := (page - 1) * pageSize
		options := options.Find()
		options.SetLimit(int64(pageSize))
		options.SetSkip(int64(skip))
		options.SetSort(bson.D{{Key: "createdAt", Value: -1}})

		responses, err := params.MongoService.ListResponses(c, bson.M{"formID": formID}, options)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			logger.Error("Failed to list form responses", err)
			return
		}

		processedResponses, columnOrder := processResponses(form, &responses, getDeletedColumnDataBool)

		c.JSON(http.StatusOK, gin.H{"responses": processedResponses, "columnOrder": columnOrder, "page": page, "pageSize": pageSize})
	}
}

/*
Download form responses as CSV

params:
  - form_id: ID of the form

query params:
  - getDeletedColumnData: whether to include deleted column data in the CSV (default: false)
*/
func downloadFormResponsesAsCSVHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		getDeletedColumnData := c.DefaultQuery("getDeletedColumnData", "false")
		getDeletedColumnDataBool := (getDeletedColumnData == "true")

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
		form, err := params.MongoService.GetForm(c, formID, true)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Form does not exist"})
			return
		}

		if !mongodb.CanUserModifyForm(c, params.MongoService, authenticatedUser, form.ID, form) {
			c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to access this form"})
			return
		}

		responses, err := params.MongoService.ListResponses(c, bson.M{"formID": formID}, nil)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			logger.Error("Failed to list form responses", err)
			return
		}
		processedResponses, columnOrder := processResponses(form, &responses, getDeletedColumnDataBool)

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

// Note: this only allows event admins to update responses not the user who submitted the response
func updateFormResponseHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		responseID, err := primitive.ObjectIDFromHex(c.Param("response_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid response ID"})
			return
		}

		responses, err := params.MongoService.ListResponses(c, bson.M{"_id": responseID}, nil)
		if err != nil || len(responses) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Response does not exist"})
			return
		}

		formID, err := primitive.ObjectIDFromHex(c.Param("form_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form ID"})
			return
		}

		form, err := params.MongoService.GetForm(c, formID, true)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Form does not exist"})
			return
		}

		if !mongodb.CanUserModifyForm(c, params.MongoService, authenticatedUser, form.ID, form) {
			c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to access this form"})
			return
		}

		var req models.FormResponse
		if err := utils.BindJSON(c, &req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		formData := req.Data // in form attr_id -> value format
		response := responses[0]
		response.Data = formData

		if errors := utils.ValidateStruct(utils.Validator, response); len(errors) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": strings.Join(errors, "\n")})
			return
		}

		if response.LastUpdatedAt.After(req.LastUpdatedAt) {
			c.JSON(http.StatusBadRequest, gin.H{"error": messages.UpdateAttemptOnChangedEntity})
			return
		}

		// Check pipeline
		pipelines, err := params.MongoService.ListPipelines(c, bson.M{"eventID": form.EventID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			logger.Error("Failed to list pipelines for this event", err)
			return
		}

		// Check billing
		eventDetails, err := params.MongoService.GetEvent(c, form.EventID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			logger.Error("Failed to get event details", err)
			return
		}

		u, err := params.MongoService.GetUserDetails(c, eventDetails.CreatedByID)
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

		for _, pipeline := range pipelines {
			if pipeline.Event.Type == "FieldChange" {
				// Sanity check
				if pipeline.Event.FieldChange.OnFormID != formID {
					continue
				}

				if !kafka.FieldChangeCheck(pipeline.Event.FieldChange, &response.Data) {
					continue
				}

				_, err = params.MongoService.IncrementSubscriptionUtilization(c, sub.ID, "pipelineRuns", "maxMonthlyPipelineRuns")
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Pipeline limit reached, please contact the event admin to upgrade their plan."})
					// TODO: send out email to admin
					return
				}

				err := helpers.TriggerPipeline(c, params.MessageProducer, params.MongoService, pipeline, response.Data)

				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
					logger.Error("Failed to trigger pipeline", err)
					return
				}
			}
		}

		newUpdatedAt := time.Now()
		response.LastUpdatedAt = newUpdatedAt
		_, err = params.MongoService.UpdateResponse(c, response, responseID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			logger.Error("Failed to update form response", err)
			return
		}

		c.JSON(http.StatusOK, gin.H{"id": responseID, "lastUpdatedAt": newUpdatedAt})
	}
}
