package users

import (
	"api/internal/middlewares"
	"api/internal/types"
	"net/http"
	"shared/models"
	"shared/utils"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RegisterRoutes sets up the routes for user management
func RegisterRoutes(r *gin.RouterGroup, params *types.RouteParams) {
	r.GET("/me", middlewares.JWTAuthMiddleware(), getUserMyself(params))
	r.PUT("/me", middlewares.JWTAuthMiddleware(), updateUserMyself(params))
	r.GET("/me/subscription", middlewares.JWTAuthMiddleware(), getSubscriptionUtilization(params))
	r.GET("/:id", getUserDetails(params))

}

func getUserMyself(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return // Error is handled in GetUserFromContext
		}

		user, err := params.MongoService.FindUserByEmail(c, authenticatedUser.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user details"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

type updateUserRequest struct {
	Email     string `json:"email" validate:"required,email"`
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
	Birthday  string `json:"birthday" validate:"required,dateformat=01/02/2006,minage=13;01/02/2006"`
}

func updateUserMyself(params *types.RouteParams) gin.HandlerFunc {
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
			FirstName: updatedUserDetails.FirstName,
			LastName:  updatedUserDetails.LastName,
			Birthday:  parsedBirthday,
		}

		err = params.MongoService.UpdateUserDetails(c, authenticatedUser.ID, updatedUserDetailsModel)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user details"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User details updated successfully"})
	}
}

// get user details
func getUserDetails(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIdStr := c.Param("id")
		userId, err := primitive.ObjectIDFromHex(userIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		user, err := params.MongoService.GetUserDetails(c, userId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user details"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

func getSubscriptionUtilization(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		u, err := params.MongoService.GetUserDetails(c, authenticatedUser.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user details"})
			return
		}

		if u.CurrentSubscriptionID == primitive.NilObjectID {
			c.JSON(http.StatusOK, gin.H{"subscription": nil})
			return
		}

		subscriptionUtilization, err := params.MongoService.GetSubscription(c, u.CurrentSubscriptionID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve subscription utilization"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"subscription": subscriptionUtilization})
	}
}
