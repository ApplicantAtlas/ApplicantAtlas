package users

import (
	"api/internal/middlewares"
	"net/http"
	"shared/models"
	"shared/mongodb"
	"shared/utils"
	"time"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up the routes for user management
func RegisterRoutes(r *gin.RouterGroup, mongoService mongodb.MongoService) {
	r.GET("/me", middlewares.JWTAuthMiddleware(), getUserMyself(mongoService))
	r.PUT("/me", middlewares.JWTAuthMiddleware(), updateUserMyself(mongoService))
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

type updateUserRequest struct {
	Email       string `json:"email" validate:"required,email"`
	FirstName   string `json:"firstName" validate:"required"`
	LastName    string `json:"lastName" validate:"required"`
	SchoolEmail string `json:"schoolEmail" validate:"omitempty,email"`
	Birthday    string `json:"birthday" validate:"required,dateformat=01/02/2006,minage=13;01/02/2006"`
}

func updateUserMyself(mongoService mongodb.MongoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		var updatedUserDetails updateUserRequest
		if err := c.ShouldBindJSON(&updatedUserDetails); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		parsedBirthday, err := time.Parse("01/02/2006", updatedUserDetails.Birthday)
		if err != nil {
			// This should never happen because the dateformat validator should catch this
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}

		var updatedUserDetailsModel models.User = models.User{
			FirstName:   updatedUserDetails.FirstName,
			LastName:    updatedUserDetails.LastName,
			SchoolEmail: updatedUserDetails.SchoolEmail,
			Birthday:    parsedBirthday,
		}

		err = mongoService.UpdateUserDetails(c, authenticatedUser.ID, updatedUserDetailsModel)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user details"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User details updated successfully"})
	}
}
