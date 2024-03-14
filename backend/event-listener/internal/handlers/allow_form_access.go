package handlers

import (
	"errors"
	"fmt"
	"shared/kafka"
	"shared/mongodb"
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
	fmt.Println(allowFormAccessAction)
	return errors.New("not implemented")
}
