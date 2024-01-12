package handlers

import (
	"errors"
	"fmt"
	"shared/kafka"
)

type AllowFormAccessHandler struct{}

func (s AllowFormAccessHandler) HandleAction(action kafka.PipelineActionMessage) error {
	allowFormAccessAction, ok := action.(*kafka.AllowFormAccessMessage)
	if !ok {
		return errors.New("invalid action type for AllowFormAccessHandler")
	}
	fmt.Println(allowFormAccessAction)
	return errors.New("not implemented")
}
