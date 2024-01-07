package handlers

import (
	"errors"
	"fmt"
	"shared/models"
)

type SendEmailHandler struct{}

func (s SendEmailHandler) HandleAction(action models.PipelineAction) error {
	sendEmailAction, ok := action.(models.SendEmail)
	if !ok {
		return errors.New("invalid action type for SendEmailHandler")
	}
	// Now you can work with sendEmailAction, which is of type models.SendEmail
	fmt.Println(sendEmailAction)
	return errors.New("not implemented")
}
