package routes

import (
	"api/internal/routes/auth"
	"api/internal/routes/events"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures the API routes
func SetupRoutes(r *gin.Engine) {
	authGroup := r.Group("/auth")
	auth.RegisterRoutes(authGroup)

	eventGroup := r.Group("/events")
	events.RegisterRoutes(eventGroup)

}
