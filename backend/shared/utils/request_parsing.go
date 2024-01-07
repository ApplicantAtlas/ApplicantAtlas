package utils

import (
	"errors"

	"github.com/gin-gonic/gin"
)

var (
	// ErrMissingJSON is returned when a JSON body is missing from a request.
	ErrMissingJSON = errors.New("this endpoint requires a JSON body")

	// ErrInvalidJSON is returned when a JSON body is invalid.
	ErrInvalidJSON = errors.New("invalid JSON body")
)

// This wraps the gin.Context.BindJSON() method to return a custom error message if the JSON is invalid or missing.
func BindJSON(c *gin.Context, obj any) error {
	err := c.BindJSON(obj)
	if err != nil {
		if err.Error() == "EOF" {
			return ErrMissingJSON
		}

		if err.Error() == "unexpected EOF" {
			return ErrInvalidJSON
		}

		// Otherwise return the original error
		return err
	}
	return nil
}
