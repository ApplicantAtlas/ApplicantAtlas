package pipelines

import (
	"api/internal/types"
	"shared/kafka"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RegisterTestRoute(r *gin.RouterGroup, params *types.RouteParams) {
	r.GET("test", testPipeline(params))
}

func testPipeline(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		emailTemplateID, err := primitive.ObjectIDFromHex("5f9f5b5b9c6d1e1d7f9b3b1a")
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid form ID"})
			return
		}

		pipelineRunID, err := primitive.ObjectIDFromHex("5f9f5b5b9c6d1e1d7f9b3b1a")
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid pipeline run ID"})
			return
		}

		eventID, err := primitive.ObjectIDFromHex("5f9f5b5b9c6d1e1d7f9b3b1a")
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid event ID"})
			return
		}

		data := map[string]interface{}{
			"firstName": "John",
			"lastName":  "Doe",
		}

		var emailFieldID string
		testAction := kafka.NewSendEmailMessage("email-action", pipelineRunID, emailTemplateID, eventID, data, emailFieldID)

		err = kafka.WriteActionToKafka(params.KafkaProducer, testAction)
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"message": "Success"})
	}
}
