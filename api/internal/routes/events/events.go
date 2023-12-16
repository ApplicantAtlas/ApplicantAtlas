package events

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up the routes for event management
func RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/", listEventsHandler)
	r.POST("/", createEventHandler)
}

func listEventsHandler(c *gin.Context) {
	// Handle listing of events

	// return dummy json
	c.JSON(200, gin.H{
		"message": "ping",
	})
}

func createEventHandler(c *gin.Context) {
	// Handle event creation
	c.JSON(200, gin.H{
		"message": "pong2",
	})
}
