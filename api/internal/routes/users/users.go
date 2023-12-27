package users

import (
	"api/internal/middlewares"
	"api/internal/mongodb"
	"api/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up the routes for user management
func RegisterRoutes(r *gin.RouterGroup, mongoService mongodb.MongoService) {
	r.GET("/me", middlewares.JWTAuthMiddleware(), getUserMyself(mongoService))
}

func getUserMyself(mongoService mongodb.MongoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return // Error is handled in GetUserFromContext
		}

		user, err := mongoService.FindUserByEmail(c, authenticatedUser.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user details"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}
