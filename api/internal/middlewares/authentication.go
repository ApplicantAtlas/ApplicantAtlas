package middlewares

import (
	"api/internal/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// JWTAuthMiddleware is a middleware that checks for a valid JWT token, and sets the user info in the context
func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")

		// Return 401 if no token is provided
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			return
		}

		// Verify the JWT token
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")
		user, err := utils.VerifyJWT(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// Token is valid, set user info in context and proceed
		c.Set("user", user)
		c.Next()
	}
}
