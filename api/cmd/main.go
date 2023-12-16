package main

import (
	"api/internal/mongodb"
	"api/internal/routes"
	"context"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	mongoService, cleanup, err := mongodb.NewService()
	if err != nil {
		log.Fatal(err)
	}
	defer cleanup()

	// Setup routes
	routes.SetupRoutes(r, mongoService)

	// Check if running in AWS Lambda or not
	if runningInAWSLambda() {
		// Create a Lambda server with the Gin router
		// This converts lambda events to http.Request objects
		ginLambda := ginadapter.New(r)
		lambda.Start(func(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
			// Proxy the request to the Gin engine
			return ginLambda.ProxyWithContext(ctx, req)
		})
	} else {
		// Running outside AWS Lambda
		// This is to handle graceful shutdown (will close connections to MongoDB with the defer cleanup)
		srv := &http.Server{
			Addr:    ":8080",
			Handler: r,
		}

		go func() {
			if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
				log.Fatalf("listen: %s\n", err)
			}
		}()

		// Wait for interrupt signal to gracefully shut down the server
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit

		// The context is used to inform the server it has 5 seconds to finish
		// the request it is currently handling
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := srv.Shutdown(ctx); err != nil {
			log.Fatal("Server forced to shutdown:", err)
		}

		log.Println("Server exiting")
	}
}

func runningInAWSLambda() bool {
	// AWS Lambda sets some specific environment variables
	// You can check for the existence of one of them.
	return os.Getenv("AWS_LAMBDA_FUNCTION_NAME") != "" // Note: untested
}
