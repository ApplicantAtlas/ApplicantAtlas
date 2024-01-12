package utils

import (
	"crypto/rand"
	"errors"
	"log"
	"net/http"
	"os"
	"shared/models"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var jwtSecret []byte

func init() {
	secret := os.Getenv("JWT_SECRET_TOKEN")

	if secret == "" || secret == "secret_please_change" {
		log.Println("[WARNING] JWT_SECRET_TOKEN is not set or is set to a default value. Generating a random secret key, this will cause all existing JWT tokens to be invalid and will not work on lambda or multi-instance deployments.")
		jwtSecret = generateRandomSecret(32)
	} else {
		jwtSecret = []byte(secret)
	}
}

// GenerateJWT generates a JWT token for the given user
func GenerateJWT(user *models.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":        user.ID.Hex(),
		"email":     user.Email,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"exp":       time.Now().Add(time.Hour * 72).Unix(),
	})

	return token.SignedString(jwtSecret)
}

// VerifyJWT validates a JWT token and returns the user information if it's valid
func VerifyJWT(tokenString string) (*models.User, error) {
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, err := hexToObjectID(claims["id"].(string))
		if err != nil {
			return nil, err
		}
		return &models.User{
			ID:        userID,
			Email:     claims["email"].(string),
			FirstName: claims["firstName"].(string),
			LastName:  claims["lastName"].(string),
		}, nil
	} else {
		return nil, errors.New("invalid token")
	}
}

// GetUserFromContext retrieves the authenticated user from the Gin context
func GetUserFromContext(c *gin.Context, writeResponse bool) (*models.User, bool) {
	var user interface{}
	user, exists := c.Get("user")
	if !exists {
		// Lets also try to pull from the Authorization header, this condition hits for when a function is optionally authenticated
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			if writeResponse {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			}
			return nil, false
		}

		// Verify the JWT token
		var err error
		user, err = VerifyJWT(authHeader)
		if err != nil {
			if writeResponse {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			}
			return nil, false
		}
	}

	authenticatedUser, ok := user.(*models.User)
	if !ok {
		if writeResponse {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
		return nil, false
	}

	if authenticatedUser.ID == primitive.NilObjectID {
		if writeResponse {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		}
		return nil, false
	}

	return authenticatedUser, true
}

// generateRandomSecret generates a random secret key of the given length
func generateRandomSecret(length int) []byte {
	b := make([]byte, length)
	_, err := rand.Read(b)
	if err != nil {
		log.Fatalf("Failed to generate random JWT secret: %v", err)
	}
	return b
}

// hexToObjectID converts a hex string to a primitive.ObjectID
func hexToObjectID(hexStr string) (primitive.ObjectID, error) {
	objID, err := primitive.ObjectIDFromHex(hexStr)
	if err != nil {
		return primitive.NilObjectID, err
	}
	return objID, nil
}

//
// Document Authentication Helpers
//
