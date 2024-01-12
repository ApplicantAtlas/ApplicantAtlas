package middlewares

import (
	"net/http"
	"net/http/httptest"
	"shared/models"
	"shared/utils"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(JWTAuthMiddleware())
	return r
}

func TestJWTAuthMiddleware(t *testing.T) {
	r := setupRouter()

	// Mock handler to check if middleware passes control
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "passed"})
	})

	// Create a test user
	testUser := models.User{
		Email:     "test@example.com",
		FirstName: "John",
		LastName:  "Doe",
	}

	// Generate a valid token
	validToken, _ := utils.GenerateJWT(&testUser)

	// Test cases
	tests := []struct {
		name           string
		token          string
		expectedStatus int
	}{
		{"Valid Token", "Bearer " + validToken, http.StatusOK},
		{"Invalid Token", "Bearer invalidtoken", http.StatusUnauthorized},
		{"No Token", "", http.StatusUnauthorized},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/test", nil)
			req.Header.Set("Authorization", tc.token)
			resp := httptest.NewRecorder()
			r.ServeHTTP(resp, req)

			assert.Equal(t, tc.expectedStatus, resp.Code)
		})
	}
}
