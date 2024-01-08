package handlers

import (
	"errors"
	"fmt"
	"shared/kafka"
)

type SendEmailHandler struct{}

func (s SendEmailHandler) HandleAction(action kafka.PipelineActionMessage) error {
	sendEmailAction, ok := action.(*kafka.SendEmailMessage)
	if !ok {
		return errors.New("invalid action type for SendEmailHandler")
	}
	fmt.Println(sendEmailAction)
	return errors.New("not implemented")
}
