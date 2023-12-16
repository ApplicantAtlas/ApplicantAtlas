package mongodb

import "errors"

// ErrUserAlreadyExists is returned when the user already exists in the database
var ErrUserAlreadyExists = errors.New("user already exists")
