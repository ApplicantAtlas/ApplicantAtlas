package mongodb

import "errors"

var (
	// ErrUserAlreadyExists is returned when the user already exists in the database
	ErrUserAlreadyExists = errors.New("user already exists")

	// ErrEventNameRequired is returned when the event name is not provided
	ErrEventNameRequired = errors.New("event name is required")

	// ErrUserNotAuthenticated is returned when the user is not authenticated
	ErrUserNotAuthenticated = errors.New("user is not authenticated")

	// ErrUserNotAuthorized is returned when the user does not have admin permission to modify the document
	ErrUserNotAuthorized = errors.New("user is not authorized to modify the document")
)
