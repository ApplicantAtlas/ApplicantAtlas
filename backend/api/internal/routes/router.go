package routes

import (
	"api/internal/routes/auth"
	"api/internal/routes/emails"
	"api/internal/routes/events"
	"api/internal/routes/forms"
	"api/internal/routes/pipelines"
	"api/internal/routes/users"
	"api/internal/types"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures the API routes
func SetupRoutes(r *gin.Engine, params *types.RouteParams) {
	authGroup := r.Group("/auth")
	auth.RegisterRoutes(authGroup, params)

	eventGroup := r.Group("/events")
	events.RegisterRoutes(eventGroup, params)

	userGroup := r.Group("/users")
	users.RegisterRoutes(userGroup, params)

	formGroup := r.Group("/forms")
	forms.RegisterDefaultSelectorValues(formGroup, params)
	forms.RegisterRoutes(formGroup, params)

	pipelineGroup := r.Group("/pipelines")
	pipelines.RegisterRoutes(pipelineGroup, params)

	emailTemplateGroup := r.Group("/email_templates")
	emails.RegisterEmailTemplateRoutes(emailTemplateGroup, params)
}
