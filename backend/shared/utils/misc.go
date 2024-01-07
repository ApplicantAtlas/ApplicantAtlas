package utils

import "os"

func RunningInAWSLambda() bool {
	// AWS Lambda sets some specific environment variables
	// You can check for the existence of one of them.
	return os.Getenv("AWS_LAMBDA_FUNCTION_NAME") != "" // Note: untested
}
