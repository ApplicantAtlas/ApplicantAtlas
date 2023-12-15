package auth

import (
	"api/internal/models"
	"api/internal/utils"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// RegisterRoutes sets up the routes for authentication
func RegisterRoutes(r *gin.RouterGroup) {
	r.POST("/login", loginHandler)
	r.POST("/register", registerHandler)
}
func loginHandler(c *gin.Context) {
	// Handle login (to be implemented)
	c.JSON(200, gin.H{"message": "Login functionality not yet implemented"})
}

func registerHandler(c *gin.Context) {
	var newUser models.User
	if err := c.BindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Input validation (to be implemented)
	// TODO: check if password is strong enough (to be implemented)
	// TODO: check if email is already registered (to be implemented)

	// Hash the password
	hash, err := bcrypt.GenerateFromPassword([]byte(newUser.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	newUser.PasswordHash = string(hash)

	// Insert the new user into the database
	client, err := utils.GetMongoClient()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}

	mongodb := client.Database(utils.MongoDBName)
	defer client.Disconnect(context.Background())

	collection := mongodb.Collection("users")
	_, err = collection.InsertOne(context.Background(), newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}
