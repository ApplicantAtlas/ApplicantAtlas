package auth

import (
	"api/internal/middlewares"
	"api/internal/models"
	"api/internal/mongodb"
	"api/internal/utils"
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// RegisterRoutes sets up the routes for authentication
func RegisterRoutes(r *gin.RouterGroup, mongoService mongodb.MongoService) {
	r.POST("/login", loginUser(mongoService))
	r.POST("/register", registerUser(mongoService))
	r.DELETE("/delete", middlewares.JWTAuthMiddleware(), deleteUser(mongoService))
}

type loginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func loginUser(mongoService mongodb.MongoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req loginRequest
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user, err := mongoService.FindUserByEmail(context.Background(), req.Email)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				// User not found
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid credentials"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to login"})
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
}

type registerRequest struct {
	Email       string `json:"email" validate:"required,email"`
	Password    string `json:"password" validate:"required,securepwd"`
	FirstName   string `json:"firstName" validate:"required"`
	LastName    string `json:"lastName" validate:"required"`
	SchoolEmail string `json:"schoolEmail" validate:"omitempty,email"`
	Birthday    string `json:"birthday" validate:"required,dateformat=01/02/2006"`
}

func registerUser(mongoService mongodb.MongoService) gin.HandlerFunc {
	return func(c *gin.Context) {
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
		_, err = mongoService.InsertUser(context.Background(), newUser)
		if err != nil {
			if err == mongodb.ErrUserAlreadyExists {
				c.JSON(http.StatusBadRequest, gin.H{"error": "An account with that email already exists"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "User registered successfully, please login"})
	}
}

func deleteUser(mongoService mongodb.MongoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c)
		if !ok {
			return // Error is handled in GetUserFromContext
		}

		_, err := mongoService.DeleteUserByEmail(context.Background(), authenticatedUser.Email)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Account deleted successfully"})
	}
}
