package utils

import (
	"fmt"
	"regexp"
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
}

// minAgeValidation is a custom validation function for minimum age.
func minAgeValidation(fl validator.FieldLevel) bool {
	params := strings.Split(fl.Param(), ";")
	if len(params) != 2 {
		fmt.Println("Invalid number of parameters for minage validator")
		return false
	}

	minAge, err := strconv.Atoi(params[0])
	if err != nil {
		fmt.Printf("Invalid minage parameter: %v\n", err)
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
