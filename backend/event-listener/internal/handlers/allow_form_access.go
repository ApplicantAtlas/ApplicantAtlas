package handlers

import (
	"context"
	"errors"
	"shared/kafka"
	"shared/models"
	"shared/mongodb"
	"time"
)

type AllowFormAccessHandler struct {
	mongo *mongodb.Service
}

func NewAllowFormAccessHandler(mongo *mongodb.Service) *AllowFormAccessHandler {
	return &AllowFormAccessHandler{mongo: mongo}
}

func (s AllowFormAccessHandler) HandleAction(action kafka.PipelineActionMessage) error {
	allowFormAccessAction, ok := action.(*kafka.AllowFormAccessMessage)
	if !ok {
		return errors.New("invalid action type for AllowFormAccessHandler")
	}

	// Create the form submitter object
	email := ""
	if allowFormAccessAction.EmailFieldID != "" {
		email = allowFormAccessAction.Data[allowFormAccessAction.EmailFieldID].(string)
	}

	if email == "" {
		return errors.New("could not find email in data")
	}

	newSubmitter := models.FormAllowedSubmitter{
		Email: email,
	}

	if allowFormAccessAction.Options.ExpiresInHours > 0 {
		newSubmitter.ExpiresAt = time.Now().Add(time.Hour * time.Duration(allowFormAccessAction.Options.ExpiresInHours))
	}

	// Read the form from db
	form, err := s.mongo.GetForm(context.Background(), allowFormAccessAction.ToFormID, false)
	if err != nil {
		return err
	}

	// Check if the user is already allowed to access the form
	for _, allowedSubmitter := range form.AllowedSubmitters {
		if allowedSubmitter.Email == email {
			if allowedSubmitter.ExpiresAt.IsZero() || allowedSubmitter.ExpiresAt.After(time.Now()) {
				// The user already has a valid access to the form
				return nil
			}
		}
	}

	// Update form with updated access
	_, err = s.mongo.AddAllowedSubmitter(context.Background(), allowFormAccessAction.ToFormID, newSubmitter)
	if err != nil {
		return err
	}

	return nil
}
