package utils

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// Test struct for validation
type TestStruct struct {
	Email       string `validate:"required,email"`
	Password    string `validate:"required,securepwd"`
	DateOfBirth string `validate:"required,dateformat=01/02/2006,minage=13;01/02/2006"`
}

func TestValidateStruct(t *testing.T) {
	// Test cases
	cases := []struct {
		name     string
		input    TestStruct
		expected []string // Expected error messages
	}{
		{
			name: "Valid Input",
			input: TestStruct{
				Email:       "test@example.com",
				Password:    "ValidPass123!",
				DateOfBirth: "01/01/2000",
			},
			expected: nil,
		},
		{
			name: "Invalid Email",
			input: TestStruct{
				Email:       "invalidemail",
				Password:    "ValidPass123!",
				DateOfBirth: "01/01/2000",
			},
			expected: []string{"Invalid email format"},
		},
		{
			name: "Weak Password",
			input: TestStruct{
				Email:       "test@example.com",
				Password:    "weak",
				DateOfBirth: "01/01/2000",
			},
			expected: []string{"Password must be at least 12 characters long\nPassword must contain at least one uppercase letter\nPassword must contain at least one number\nPassword must contain at least one of the following special characters: !@#$%^&*"},
		},
		{
			name: "Invalid Date Format",
			input: TestStruct{
				Email:       "test@example.com",
				Password:    "ValidPass123!",
				DateOfBirth: "2020-01-01",
			},
			expected: []string{"DateOfBirth is not in the correct format. Expected format: 01/02/2006"},
		},
		{
			name: "Underage",
			input: TestStruct{
				Email:       "test@example.com",
				Password:    "ValidPass123!",
				DateOfBirth: time.Now().AddDate(-10, 0, 0).Format("01/02/2006"),
			},
			expected: []string{"You must be at least 13 years old to create an account"},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			errors := ValidateStruct(Validator, tc.input)
			assert.Equal(t, tc.expected, errors)
		})
	}
}
