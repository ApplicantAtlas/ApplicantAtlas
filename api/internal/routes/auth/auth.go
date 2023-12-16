package auth

import (
	"api/internal/middlewares"
	"api/internal/models"
	"api/internal/utils"
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

// RegisterRoutes sets up the routes for authentication
func RegisterRoutes(r *gin.RouterGroup) {
	r.POST("/login", loginHandler)
	r.POST("/register", registerHandler)

	r.DELETE("/delete", middlewares.JWTAuthMiddleware(), deleteHandler)
}

type loginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func loginHandler(c *gin.Context) {
	var req loginRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by email
	client, err := utils.GetMongoClient()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error"})
		return
	}
	mongodb := client.Database(utils.MongoDBName)
	collection := mongodb.Collection("users")

	var user models.User
	err = collection.FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

type registerRequest struct {
	Email       string `json:"email" validate:"required,email"`
	Password    string `json:"password" validate:"required,securepwd"`
	FirstName   string `json:"firstName" validate:"required"`
	LastName    string `json:"lastName" validate:"required"`
	SchoolEmail string `json:"schoolEmail" validate:"omitempty,email"`
	Birthday    string `json:"birthday" validate:"required,dateformat=01/02/2006"`
}

func registerHandler(c *gin.Context) {
	var req registerRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate request
	if errors := utils.ValidateStruct(utils.Validator, req); len(errors) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": strings.Join(errors, "\n")})
		return
	}

	// Hash the password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Transform the Birthday string to time.Time
	parsedBirthday, err := time.Parse("01/02/2006", req.Birthday)
	if err != nil {
		// This should never happen because the dateformat validator should catch this
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	// Create a new user
	newUser := models.User{
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        req.Email,
		SchoolEmail:  req.SchoolEmail,
		Birthday:     parsedBirthday,
		PasswordHash: string(hash),
	}

	// Insert the new user into the database
	client, err := utils.GetMongoClient()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
		return
	}

	mongodb := client.Database(utils.MongoDBName)
	defer client.Disconnect(context.Background())

	collection := mongodb.Collection("users")

	// Check if email is already registered
	var existingUser models.User
	err = collection.FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "An account with that email already exists"})
		return
	}

	// Insert the new user
	_, err = collection.InsertOne(context.Background(), newUser)
	if err != nil {
		log.Fatal(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully, please login"})
}

// Delete self from database
func deleteHandler(c *gin.Context) {
	authenticatedUser, ok := utils.GetUserFromContext(c)
	if !ok {
		// Gin response is already handled in GetUserFromContext
		return
	}

	// Delete user from database
	client, err := utils.GetMongoClient()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error"})
		return
	}

	mongodb := client.Database(utils.MongoDBName)
	collection := mongodb.Collection("users")
	_, err = collection.DeleteOne(context.Background(), bson.M{"email": authenticatedUser.Email})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Account deleted successfully"})
}
