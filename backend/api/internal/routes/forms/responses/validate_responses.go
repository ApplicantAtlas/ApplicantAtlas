package responses

import (
	"fmt"
	"regexp"
	"shared/models"
	"time"

	"github.com/nyaruka/phonenumbers"
)

const emailPattern = `^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$`
const dateFormat = "2006-01-02T15:04:05.000Z"

var (
	emailRegex = regexp.MustCompile(emailPattern)
)

func ValidateResponse(attrValue interface{}, attr models.FormField) error {
	// Validate require
	if attr.Required && attrValue == nil {
		return fmt.Errorf("field %s is required, got nil", attr.Question)
	}

	// todo: this entire thing might need to have different nil checks
	switch attr.Type {
	case "text":
		if attr.AdditionalValidation.IsEmail.IsEmail {
			email := attrValue.(string)
			isEmail := emailRegex.MatchString(email)
			if !isEmail {
				return fmt.Errorf("field %s is not a valid email", attr.Question)
			}

			// Additional email validation
			if attr.AdditionalValidation.IsEmail.RequireDomain != nil {
				requireDomain := attr.AdditionalValidation.IsEmail.RequireDomain
				allowSubdomains := attr.AdditionalValidation.IsEmail.AllowSubdomains
				domainValid := validateDomain(email, requireDomain, allowSubdomains)
				if !domainValid {
					return fmt.Errorf("field %s has a disallowed domain", attr.Question)
				}
			}

			if attr.AdditionalValidation.IsEmail.AllowTLDs != nil {
				allowTLDs := attr.AdditionalValidation.IsEmail.AllowTLDs
				tldValid := validateTLD(email, allowTLDs)
				if !tldValid {
					return fmt.Errorf("field %s has a disallowed top-level domain", attr.Question)
				}
			}
		}
	case "number":
		// min max
		// todo: check if int is right type
		if attr.AdditionalValidation.Min != 0 {
			if attrValue.(int) < attr.AdditionalValidation.Min {
				return fmt.Errorf("field %s is less than the minimum value allowed", attr.Question)
			}
		}

		if attr.AdditionalValidation.Max != 0 {
			if attrValue.(int) > attr.AdditionalValidation.Max {
				return fmt.Errorf("field %s is greater than the maximum value allowed", attr.Question)
			}
		}
	case "date", "timestamp":
		// min max
		dateStr := attrValue.(string)
		date, err := time.Parse(dateFormat, dateStr)
		if err != nil {
			return fmt.Errorf("field %s has an invalid date format", attr.Question)
		}

		var againstDate time.Time
		if attr.AdditionalValidation.DateAndTimestampFromTimeField.IsZero() {
			againstDate = time.Now()
		} else {
			againstDate = attr.AdditionalValidation.DateAndTimestampFromTimeField
		}

		if attr.AdditionalValidation.Min != 0 {
			minDate := againstDate.AddDate(-attr.AdditionalValidation.Min, 0, 0)
			if date.After(minDate) {
				return fmt.Errorf("field %s is not older than the minimum age allowed of %b", attr.Question, attr.AdditionalValidation.Min)
			}
		}

		if attr.AdditionalValidation.Max != 0 {
			maxDate := againstDate.AddDate(-attr.AdditionalValidation.Max, 0, 0)
			if date.Before(maxDate) {
				return fmt.Errorf("field %s is not younger than the maximum age allowed of %b", attr.Question, attr.AdditionalValidation.Max)
			}
		}
	case "telephone":
		phoneStr := attrValue.(string)
		// Blank region tells the library to figure it out
		phoneNumber, err := phonenumbers.Parse(phoneStr, "")
		if err != nil {
			return fmt.Errorf("field %s has an invalid phone number", attr.Question)
		}

		if !phonenumbers.IsValidNumber(phoneNumber) {
			return fmt.Errorf("field %s has an invalid phone number", attr.Question)
		}
	case "select", "radio":
		// check if it's in the options
		if attr.Options != nil {
			options := attr.Options
			option := attrValue.(string)
			found := false
			for _, o := range options {
				if o == option {
					found = true
					break
				}
			}

			if !found {
				return fmt.Errorf("field %s is not a valid option", attr.Question)
			}
		}
	case "multiselect":
		// check if it's in the options
		if attr.Options != nil {
			options := attr.Options
			option := attrValue.([]string)
			for _, o := range option {
				found := false
				for _, op := range options {
					if o == op {
						found = true
						break
					}
				}

				if !found {
					return fmt.Errorf("field %s has an invalid option", attr.Question)
				}
			}
		}
	default:
		break
	}

	return nil
}

// Email Validator Helpers
// We should probably move validators to a subpackage

// validateDomain checks if the email has an allowed domain
func validateDomain(email string, requireDomain []string, allowSubdomains bool) bool {
	domainRegexPattern := ""
	if allowSubdomains {
		domainRegexPattern = `@([a-zA-Z0-9.-]+\.)?(` + joinDomains(requireDomain) + `)$`
	} else {
		domainRegexPattern = `@(` + joinDomains(requireDomain) + `)$`
	}
	domainRegex := regexp.MustCompile(domainRegexPattern)
	return domainRegex.MatchString(email)
}

// validateTLD checks if the email has an allowed top-level domain
func validateTLD(email string, allowTLDs []string) bool {
	tldRegexPattern := `\.(` + joinDomains(allowTLDs) + `)$`
	tldRegex := regexp.MustCompile(tldRegexPattern)
	return tldRegex.MatchString(email)
}

// joinDomains joins the domains into a regex pattern
func joinDomains(domains []string) string {
	return fmt.Sprintf("(%s)", stringJoin(domains, "|"))
}

// stringJoin joins a slice of strings with a delimiter
func stringJoin(elements []string, delimiter string) string {
	result := ""
	for i, element := range elements {
		if i > 0 {
			result += delimiter
		}
		result += element
	}
	return result
}
