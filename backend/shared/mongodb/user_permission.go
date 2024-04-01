// This package is for helper functions checking if a user can modify a document.
package mongodb

import (
	"shared/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CanUserModifyPipeline checks if the user provided can modify a pipeline.
func CanUserModifyPipeline(c *gin.Context, m MongoService, u *models.User, pipelineID primitive.ObjectID, pipelineObject *models.PipelineConfiguration) bool {
	if u == nil {
		return false
	}

	pipeline := pipelineObject
	if pipeline == nil {
		p, err := m.GetPipeline(c, pipelineID)
		if err != nil {
			return false
		}
		pipeline = p
	}
	return CanUserModifyEvent(c, m, u, pipeline.EventID, nil)
}

// CanUserModifyEmailTemplate checks if the user provided can modify an email template.
func CanUserModifyEmailTemplate(c *gin.Context, m MongoService, u *models.User, templateID primitive.ObjectID, template *models.EmailTemplate) bool {
	if u == nil {
		return false
	}

	emailTemplate := template
	if emailTemplate == nil {
		t, err := m.GetEmailTemplate(c, templateID)
		if err != nil {
			return false
		}
		emailTemplate = t
	}
	return CanUserModifyEvent(c, m, u, emailTemplate.EventID, nil)
}

// CanUserModifyForm checks if the user provided can modify a form.
func CanUserModifyForm(c *gin.Context, m MongoService, u *models.User, formID primitive.ObjectID, formObject *models.FormStructure) bool {
	if u == nil {
		return false
	}

	form := formObject
	if form == nil {
		f, err := m.GetForm(c, formID, true)
		if err != nil {
			return false
		}

		form = f
	}

	return CanUserModifyEvent(c, m, u, form.EventID, nil)
}

// CanUserModify event checks if the given user and event can manipulate an event
// If eventObject is nil, we will retrieve a new object from mongo, otherwise we use it.
func CanUserModifyEvent(c *gin.Context, m MongoService, u *models.User, eventID primitive.ObjectID, eventObject *models.Event) bool {
	if u == nil {
		return false
	}

	event := eventObject
	if event == nil {
		e, err := m.GetEvent(c, eventID)
		if err != nil {
			return false
		}

		event = e
	}

	var found = false
	for _, organizerID := range event.OrganizerIDs {
		if organizerID == u.ID {
			found = true
			break
		}
	}

	return found
}
