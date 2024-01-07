package forms

import (
	"net/http"
	"shared/models"
	"shared/mongodb"
	"shared/utils"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RegisterRoutes(r *gin.RouterGroup, mongoService mongodb.MongoService) {
	r.GET(":form_id", getFormDataHandler(mongoService))
	r.POST("", createFormHandler(mongoService))
	r.PUT(":form_id", updateFormHandler(mongoService))
	r.DELETE(":form_id", deleteFormHandler(mongoService))
}

func getFormDataHandler(mongoService mongodb.MongoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Restrict to approved users for like rsvp forms and such
		formID, err := primitive.ObjectIDFromHex(c.Param("form_id"))
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid form ID"})
			return
		}

		form, err := mongoService.GetForm(c, formID)
		if err != nil {
			c.JSON(404, gin.H{"error": "Form not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"form": form})
	}
}

func createFormHandler(mongoService mongodb.MongoService) gin.HandlerFunc {
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
		eventID, err := primitive.ObjectIDFromHex(req.EventID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
			return
		}

		event, err := mongoService.GetEvent(c, eventID)
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
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to create a form for this event"})
			return
		}

		formID, err := mongoService.CreateForm(c, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create form"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"id": formID})
	}
}

func deleteFormHandler(mongoService mongodb.MongoService) gin.HandlerFunc {
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

		if !isUserAuthorizedForForm(c, mongoService, authenticatedUser, formID) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to delete this form"})
			return
		}

		_, err = mongoService.DeleteForm(c, formID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete form"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Form deleted successfully"})
	}
}

func updateFormHandler(mongoService mongodb.MongoService) gin.HandlerFunc {
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

		if !isUserAuthorizedForForm(c, mongoService, authenticatedUser, formID) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to update this form"})
			return
		}

		_, err = mongoService.UpdateForm(c, req, formID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update form"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Form updated successfully"})
	}
}

// helpers

func isUserAuthorizedForForm(ctx *gin.Context, mongoService mongodb.MongoService, user *models.User, formID primitive.ObjectID) bool {
	if user == nil {
		return false
	}

	if user.ID == primitive.NilObjectID {
		return false
	}

	event, err := mongoService.GetEvent(ctx, formID)
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
