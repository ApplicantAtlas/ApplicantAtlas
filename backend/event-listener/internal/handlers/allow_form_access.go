package handlers

import (
	"errors"
	"fmt"
	"shared/models"
)

type AllowFormAccessHandler struct{}

func (s AllowFormAccessHandler) HandleAction(action models.PipelineAction) error {
	allowFormAccessAction, ok := action.(*models.AllowFormAccess)
	if !ok {
		return errors.New("invalid action type for AllowFormAccessHandler")
	}
	fmt.Println(allowFormAccessAction)
	return errors.New("not implemented")
}
