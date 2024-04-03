package forms

import (
	"api/internal/middlewares"
	"api/internal/routes/forms/responses"
	"api/internal/types"
	"log"
	"net/http"
	"shared/models"
	"shared/mongodb"
	"shared/utils"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RegisterRoutes(r *gin.RouterGroup, params *types.RouteParams) {
	r.GET(":form_id", middlewares.JWTAuthMiddleware(), getFormDataHandler(params))
	r.POST("", middlewares.JWTAuthMiddleware(), createFormHandler(params))
	r.PUT(":form_id", middlewares.JWTAuthMiddleware(), updateFormHandler(params))
	r.DELETE(":form_id", middlewares.JWTAuthMiddleware(), deleteFormHandler(params))

	responsesGroup := r.Group(":form_id/responses")
	responses.RegisterFormResponsesRoutes(responsesGroup, params)
}

func getFormDataHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		formID, err := primitive.ObjectIDFromHex(c.Param("form_id"))
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid form ID"})
			return
		}

		if formID.IsZero() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form ID, must not be zero value"})
			return
		}

		form, err := params.MongoService.GetForm(c, formID, false)
		if err != nil {
			c.JSON(404, gin.H{"error": "Form not found"})
			return
		}

		if form.Status != "published" {
			authenticatedUser, ok := utils.GetUserFromContext(c, true)
			if !ok {
				return
			}

			if !mongodb.CanUserModifyForm(c, params.MongoService, authenticatedUser, formID, form) {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to view this form"})
				return
			}
		}

		// Check if the authenticated user's emails are in the form's whitelist, if it exists
		if form.IsRestricted {
			allowed, restrictMessage := IsUserEmailInWhitelist(c, form.AllowedSubmitters)
			if !allowed {
				c.JSON(http.StatusUnauthorized, gin.H{"error": restrictMessage})
				return
			}
		}

		form.StripSecrets()
		c.JSON(http.StatusOK, gin.H{"form": form})
	}
}

func createFormHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.FormStructure
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

		// Check if user is authorized to create form on this event
		event, err := params.MongoService.GetEvent(c, req.EventID)
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "You are not authorized to create a form for this event"})
			return
		}

		formID, err := params.MongoService.CreateForm(c, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create form"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"id": formID})
	}
}

func deleteFormHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		// Check if user is authorized to delete form on this event
		formID, err := primitive.ObjectIDFromHex(c.Param("form_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form ID"})
			return
		}

		if formID.IsZero() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form ID, must not be zero value"})
			return
		}

		if !mongodb.CanUserModifyForm(c, params.MongoService, authenticatedUser, formID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to delete this form"})
			return
		}

		_, err = params.MongoService.DeleteForm(c, formID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete form"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Form deleted successfully"})
	}
}

func updateFormHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.FormStructure
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

		// Check if user is authorized to update form on this event
		formID, err := primitive.ObjectIDFromHex(c.Param("form_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form ID"})
			return
		}

		if formID.IsZero() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form ID, must not be zero value"})
			return
		}

		if !mongodb.CanUserModifyForm(c, params.MongoService, authenticatedUser, formID, nil) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "You are not authorized to update this form"})
			return
		}

		_, err = params.MongoService.UpdateForm(c, req, formID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update form"})
			log.Fatalf("Failed to update form: %v", err)
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Form updated successfully"})
	}
}

func IsUserEmailInWhitelist(c *gin.Context, whitelist []models.FormAllowedSubmitter) (bool, string) {
	authenticatedUser, ok := utils.GetUserFromContext(c, true)
	if !ok {
		return false, "You must be logged in to view this form"
	}

	hasExpired := false
	for _, allowedSubmitter := range whitelist {
		if allowedSubmitter.Email == authenticatedUser.Email || authenticatedUser.SchoolEmail == allowedSubmitter.Email {
			if allowedSubmitter.ExpiresAt.IsZero() || allowedSubmitter.ExpiresAt.After(time.Now()) {
				return true, ""
			} else {
				hasExpired = true
			}
		}
	}

	if hasExpired {
		// We're doing the check here incase the user has multiple emails in the whitelist and not all have expired
		return false, "Your access to this form has expired"
	}

	return false, "You are not authorized to view this form"
}
