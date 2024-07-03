package main

import (
	"context"
	"event-listener/internal/consumer"
	"event-listener/internal/handlers"
	"event-listener/internal/types"
	"log"
	"shared/mongodb"
)

var actionHandlers = map[string]types.EventHandler{}

/*
  TODO: We should consider adding like Metadata to this message that's on the PipelineConfiguration
  like EventID, PipelineID, etc. so that we can track the status of the pipeline and the events.
  We could just consume the entire PipelineConfiguration and then just process the actions in
  order.
  TODO: Lets add logging in a collection like `pipeline_runs` that tracks the status of the pipeline and report any errors

  TODO: Make this more robust
    * retry logic for failed messages

  TODO: refactor
*/

func main() {
	// Start mongo
	mongoService, cleanup, err := mongodb.NewService()
	if err != nil {
		log.Fatal(err)
	}

	actionHandlers = map[string]types.EventHandler{
		"SendEmail":       handlers.NewSendEmailHandler(mongoService),
		"AllowFormAccess": handlers.NewAllowFormAccessHandler(mongoService),
		"Webhook":         handlers.NewWebhookHandler(mongoService),
	}

	messageConsumer, err := consumer.NewMessageConsumer(mongoService, actionHandlers)
	if err != nil {
		log.Fatalf("Failed to create message consumer: %v", err)
	}

	ctx := context.Background()
	if err := messageConsumer.Consume(ctx); err != nil {
		log.Fatalf("Error consuming messages: %v", err)
	}

	// Cleanup Mongo
	cleanup()

}
