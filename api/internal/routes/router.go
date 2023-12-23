package routes

import (
	"api/internal/mongodb"
	"api/internal/routes/auth"
	"api/internal/routes/events"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures the API routes
func SetupRoutes(r *gin.Engine, mongoService mongodb.MongoService) {
	authGroup := r.Group("/auth")
	auth.RegisterRoutes(authGroup, mongoService)

	eventGroup := r.Group("/events")
	events.RegisterRoutes(eventGroup, mongoService)
}
