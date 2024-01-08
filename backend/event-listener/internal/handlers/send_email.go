package handlers

import (
	"errors"
	"fmt"
	"shared/models"
)

type SendEmailHandler struct{}

func (s SendEmailHandler) HandleAction(action models.PipelineAction) error {
	sendEmailAction, ok := action.(*models.SendEmail)
	if !ok {
		return errors.New("invalid action type for SendEmailHandler")
	}
	fmt.Println(sendEmailAction)
	return errors.New("not implemented")
}
