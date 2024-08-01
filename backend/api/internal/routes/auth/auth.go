package auth

import (
	"api/internal/middlewares"
	"api/internal/types"
	"fmt"
	"net/http"
	"shared/logger"
	"shared/models"
	"shared/mongodb"
	"shared/utils"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// RegisterRoutes sets up the routes for authentication
func RegisterRoutes(r *gin.RouterGroup, params *types.RouteParams) {
	r.POST("/login", loginUser(params))
	r.POST("/register", registerUser(params))
	r.DELETE("/delete", middlewares.JWTAuthMiddleware(), deleteUser(params))
}

type loginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func loginUser(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req loginRequest
		if err := utils.BindJSON(c, &req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user, err := params.MongoService.FindUserByEmail(c, req.Email)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				// User not found
				c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password do not match"})
				return
			}
			logger.Error("Failed to find user by email", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to login"})
			return
		}

		// Check password
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password do not match"})
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
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,securepwd"`
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
	Birthday  string `json:"birthday" validate:"required,dateformat=01/02/2006,minage=13;01/02/2006"`
}

func registerUser(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req registerRequest
		if err := utils.BindJSON(c, &req); err != nil {
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
			Birthday:     parsedBirthday,
			PasswordHash: string(hash),
		}

		// Insert the new user into the database
		r, err := params.MongoService.InsertUser(c, newUser)
		if err != nil {
			if err == mongodb.ErrUserAlreadyExists {
				c.JSON(http.StatusBadRequest, gin.H{"error": "An account with that email already exists"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
			return
		}
		newUser.ID = r.InsertedID.(primitive.ObjectID)

		// Generate JWT token
		token, err := utils.GenerateJWT(&newUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		utils.SendSlackMessage(fmt.Sprintf("New User: %s %s (%s)", newUser.FirstName, newUser.LastName, newUser.Email))
		c.JSON(http.StatusOK, gin.H{"token": token})
	}
}

// TODO: We should base this on the user's id instead of email, and handle deleting all data like responses
func deleteUser(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return // Error is handled in GetUserFromContext
		}

		_, err := params.MongoService.DeleteUserByEmail(c, authenticatedUser.Email)
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
