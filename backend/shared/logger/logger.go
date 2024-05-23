package logger

import (
	"os"

	"github.com/sirupsen/logrus"
)

// Logger is the global logger instance
var Logger *logrus.Logger

// Initialize the logger
func init() {
	Logger = logrus.New()
	Logger.SetOutput(os.Stderr)
	Logger.SetLevel(logrus.InfoLevel)
	Logger.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})
}

// Error logs an error with a custom description
func Error(description string, err error) {
	if err != nil {
		Logger.WithFields(logrus.Fields{
			"error": err,
		}).Error(description)
	}
}

// Info logs an informational message
func LogInfo(description string) {
	Logger.Info(description)
}

// Warning logs a warning message
func LogWarning(description string) {
	Logger.Warn(description)
}

// Debug logs a debug message
func LogDebug(description string) {
	Logger.Debug(description)
}
