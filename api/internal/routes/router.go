package routes

import (
	"api/internal/mongodb"
	"api/internal/routes/auth"
	"api/internal/routes/events"
	"api/internal/routes/forms"
	"api/internal/routes/users"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures the API routes
func SetupRoutes(r *gin.Engine, mongoService mongodb.MongoService) {
	authGroup := r.Group("/auth")
	auth.RegisterRoutes(authGroup, mongoService)

	eventGroup := r.Group("/events")
	events.RegisterRoutes(eventGroup, mongoService)

	userGroup := r.Group("/users")
	users.RegisterRoutes(userGroup, mongoService)

	formGroup := r.Group("/forms")
	forms.RegisterDefaultSelectorValues(formGroup, mongoService)
	forms.RegisterRoutes(formGroup, mongoService)
}
