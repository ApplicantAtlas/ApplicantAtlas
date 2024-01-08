package pipelines

import (
	"api/internal/types"
	"shared/kafka"
	"shared/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RegisterRoutes(r *gin.RouterGroup, params *types.RouteParams) {
	r.GET("", testPipeline(params))
}

func testPipeline(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		objectID, err := primitive.ObjectIDFromHex("5f9f5b5b9c6d1e1d7f9b3b1a")
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid form ID"})
			return
		}

		testAction := models.NewSendEmail(objectID)

		err = kafka.WriteActionToKafka(params.KafkaProducer, testAction)
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"message": "Success"})
	}
}
