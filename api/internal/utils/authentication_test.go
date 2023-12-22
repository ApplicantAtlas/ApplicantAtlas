package utils

import (
	"api/internal/models"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestGenerateJWT(t *testing.T) {
	user := models.User{
		Email:     "test@example.com",
		FirstName: "John",
		LastName:  "Doe",
	}

	token, err := GenerateJWT(&user)
	assert.Nil(t, err)
	assert.NotEmpty(t, token)
}

func TestVerifyJWT(t *testing.T) {
	user := models.User{
		Email:     "test@example.com",
		FirstName: "John",
		LastName:  "Doe",
	}

	// Generate a valid token
	validToken, _ := GenerateJWT(&user)

	// Generate an expired token
	expiredToken := generateExpiredJWT(user)

	// Generate a token with an invalid signature
	invalidSigToken := generateTokenWithInvalidSignature(user)

	testCases := []struct {
		name    string
		token   string
		isValid bool // Expect the token to be valid or not
	}{
		{"Valid Token", validToken, true},
		{"Expired Token", expiredToken, false},
		{"Invalid Signature", invalidSigToken, false},
		{"Malformed Token", "malformed.token.string", false},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := VerifyJWT(tc.token)
			if tc.isValid {
				assert.Nil(t, err)
			} else {
				assert.NotNil(t, err)
			}
		})
	}
}

func generateExpiredJWT(user models.User) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":     user.Email,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"exp":       time.Now().Add(-72 * time.Hour).Unix(), // Set expiration to 72 hours in the past
	})

	tokenString, _ := token.SignedString(jwtSecret)
	return tokenString
}

func generateTokenWithInvalidSignature(user models.User) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":     user.Email,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"exp":       time.Now().Add(72 * time.Hour).Unix(),
	})

	// Use a different secret to sign the token
	invalidSecret := []byte("invalid_secret")
	tokenString, _ := token.SignedString(invalidSecret)
	return tokenString
}

func TestGetUserFromContext(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(nil)

	user := models.User{
		Email:     "test@example.com",
		FirstName: "John",
		LastName:  "Doe",
	}

	// Simulate setting the user in the context
	c.Set("user", &user)

	retrievedUser, exists := GetUserFromContext(c, true)
	assert.True(t, exists)
	assert.Equal(t, user.Email, retrievedUser.Email)
}

func TestGenerateRandomSecret(t *testing.T) {
	secret := generateRandomSecret(32)
	assert.Len(t, secret, 32)
}
