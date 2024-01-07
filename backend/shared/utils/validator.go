package utils

import (
	"fmt"
	"log"
	"reflect"
	"regexp"
	"shared/models"
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
)

// Validator is the global validator instance.
var Validator *validator.Validate

func init() {
	Validator = validator.New()
	registerCustomValidations(Validator)
}

// registerCustomValidations registers all custom validation functions.
func registerCustomValidations(v *validator.Validate) {
	v.RegisterValidation("dateformat", dateFormatValidation)
	v.RegisterValidation("securepwd", securePasswordValidation)
	v.RegisterValidation("minage", minAgeValidation)
	v.RegisterValidation("timezone", timezoneValidation)
	v.RegisterValidation("requireExistsIf", requireExistsIf)
	v.RegisterValidation("comparison", validateComparison)
	v.RegisterValidation("pipelineevent", validateEventType)
	v.RegisterValidation("pipelineaction", validateActionType)
}

func validateComparison(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	switch models.Comparison(value) {
	case models.ComparisonEq, models.ComparisonNeq:
		return true
	default:
		return false
	}
}

// minAgeValidation is a custom validation function for minimum age.
func minAgeValidation(fl validator.FieldLevel) bool {
	params := strings.Split(fl.Param(), ";")
	if len(params) != 2 {
		log.Fatal("Invalid number of parameters for minage validator")
		return false
	}

	minAge, err := strconv.Atoi(params[0])
	if err != nil {
		log.Fatalf("Invalid minage parameter: %v\n", err)
		return false
	}

	dateFormat := params[1]
	dateStr := fl.Field().String()
	birthDate, err := time.Parse(dateFormat, dateStr)
	if err != nil {
		return false // Invalid date format
	}

	currentTime := time.Now()
	age := currentTime.Year() - birthDate.Year()
	if currentTime.Month() < birthDate.Month() || (currentTime.Month() == birthDate.Month() && currentTime.Day() < birthDate.Day()) {
		age--
	}

	return age >= minAge
}

// dateFormatValidation is a custom validation function for date format.
func dateFormatValidation(fl validator.FieldLevel) bool {
	layout := fl.Param() // Get the layout parameter from the tag
	_, err := time.Parse(layout, fl.Field().String())
	return err == nil
}

// securePasswordMessages is a custom validation function for password strength.
// Returns the reasons why the password is not strong enough.
func securePasswordMessages(password string) []string {
	var (
		minLen     = 12
		upperRegex = regexp.MustCompile(`[A-Z]`)
		lowerRegex = regexp.MustCompile(`[a-z]`)
		numRegex   = regexp.MustCompile(`[0-9]`)
		specRegex  = regexp.MustCompile(`[!@#\$%\^&\*]`) // Define your special characters
	)

	var reasons []string
	if len(password) < minLen {
		reasons = append(reasons, fmt.Sprintf("Password must be at least %d characters long", minLen))
	}
	if !upperRegex.MatchString(password) {
		reasons = append(reasons, "Password must contain at least one uppercase letter")
	}
	if !lowerRegex.MatchString(password) {
		reasons = append(reasons, "Password must contain at least one lowercase letter")
	}
	if !numRegex.MatchString(password) {
		reasons = append(reasons, "Password must contain at least one number")
	}
	if !specRegex.MatchString(password) {
		reasons = append(reasons, "Password must contain at least one of the following special characters: !@#$%^&*")
	}

	return reasons
}

func securePasswordValidation(fl validator.FieldLevel) bool {
	return len(securePasswordMessages(fl.Field().String())) == 0
}

func timezoneValidation(fl validator.FieldLevel) bool {
	zone := fl.Field().String()
	_, err := time.LoadLocation(zone)
	return err == nil
}

// We expect the folling format for the parameter:
// requireExistsIf=true[Address, Email, Description, ... other cols I want]
func requireExistsIf(fl validator.FieldLevel) bool {
	params := strings.Split(fl.Param(), ";")
	if len(params) < 2 {
		return false // Incorrect parameter format
	}

	boolStr := params[0]
	fieldsToCheck := params[1:]
	parent := fl.Parent() // Get the parent struct

	if (boolStr == "true") != fl.Field().Bool() {
		return true
	}

	// Check the required fields
	for _, fieldName := range fieldsToCheck {
		fieldName = strings.TrimSpace(fieldName)
		field := parent.FieldByName(fieldName)
		if !field.IsValid() || isZeroOfUnderlyingType(field.Interface()) {
			return false
		}
	}

	return true
}

func validateEventType(fl validator.FieldLevel) bool {
	if event, ok := fl.Field().Interface().(models.PipelineEvent); ok {
		eventType := event.EventType()
		switch eventType {
		case "FormSubmission", "FieldChange":
			return true
		default:
			return false
		}
	}
	return false
}

func validateActionType(fl validator.FieldLevel) bool {
	if action, ok := fl.Field().Interface().(models.PipelineAction); ok {
		actionType := action.ActionType()
		switch actionType {
		case "SendEmail", "AllowFormAccess", "Webhook":
			return true
		default:
			return false
		}
	}
	return false
}

func isZeroOfUnderlyingType(x interface{}) bool {
	return reflect.DeepEqual(x, reflect.Zero(reflect.TypeOf(x)).Interface())
}

// TranslateValidationError translates a validator.FieldError into a user-friendly message.
func TranslateValidationError(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", fe.Field())
	case "email":
		return "Invalid email format"
	case "min":
		return fmt.Sprintf("%s must be at least %s characters long", fe.Field(), fe.Param())
	case "dateformat":
		return fmt.Sprintf("%s is not in the correct format. Expected format: %s", fe.Field(), fe.Param())
	case "securepwd":
		val, ok := fe.Value().(string)
		if !ok {
			return fmt.Sprintf("%s is not valid", fe.Field())
		}

		return strings.Join(securePasswordMessages(val), "\n")
	case "minage":
		params := strings.Split(fe.Param(), ";")
		agePart := params[0] // Get the age part (first part of the parameter)
		return fmt.Sprintf("You must be at least %s years old to create an account", agePart)
	case "requireExistsIf":
		params := strings.Split(fe.Param(), ";")
		boolStr := params[0]
		fieldsToCheck := params[1:]

		return fmt.Sprintf("You must provide %s if %s is %s", strings.Join(fieldsToCheck, ", "), fe.Field(), boolStr)
	case "max":
		return fmt.Sprintf("%s must be at most %s characters long", fe.Field(), fe.Param())
	case "comparison":
		return fmt.Sprintf("%s is not a valid comparison", fe.Field())
	default:
		return fmt.Sprintf("%s is not valid", fe.Field())
	}
}

// ValidateStruct validates a struct and returns human-readable error messages.
func ValidateStruct(v *validator.Validate, s interface{}) []string {
	var userFriendlyErrors []string

	err := v.Struct(s)
	if err != nil {
		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			for _, e := range validationErrs {
				userFriendlyErrors = append(userFriendlyErrors, TranslateValidationError(e))
			}
		}
	}

	return userFriendlyErrors
}
