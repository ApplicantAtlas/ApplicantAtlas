// auth/auth_test.go
package auth

import (
	"api/internal/mocks"
	"api/internal/models"
	"api/internal/utils"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAuthHandlers(t *testing.T) {
	// Initialize the mock service
	mockMongoService := mocks.NewMockMongoService()

	// Create a gin router with the auth routes
	r := gin.Default()
	rg := r.Group("/auth")
	RegisterRoutes(rg, mockMongoService)

	user := models.User{
		FirstName:    "John",
		LastName:     "Doe",
		Email:        "john@example.com",
		PasswordHash: "",
		Birthday:     time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC),
	}

	// Test Registration
	t.Run("register new user", func(t *testing.T) {
		reqBody, _ := json.Marshal(map[string]string{
			"email":     user.Email,
			"password":  "myPassword123!333#",
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			"birthday":  user.Birthday.Format("01/02/2006"),
		})
		req, _ := http.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(reqBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("register existing user", func(t *testing.T) {
		// Same request body as before
		reqBody := []byte(`{"email":"
		","password":"myPassword123!333#","firstName":"John","lastName":"Doe","birthday":"01/01/1995"}`)
		req, _ := http.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(reqBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Test invalid fields in request body
	t.Run("register user with invalid request body", func(t *testing.T) {
		reqBody := []byte(`{"email":"2","password":"1","birthday":"jan 1st"}`)
		req, _ := http.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(reqBody))

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)

		// test with invalid email
		reqBody = []byte(`{"email":"invalid_email","password":"myPassword123!333#","firstName":"John","lastName":"Doe","birthday":"01/01/1995"}`)
		req, _ = http.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(reqBody))

		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)

		// test with insecure password
		reqBody = []byte(`{"email":"john@example.com","password":"password","firstName":"John","lastName":"Doe","birthday":"01/01/1995"}`)
		req, _ = http.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(reqBody))

		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)

		// test with invalid birthday
		reqBody = []byte(`{"email":"john@example.com","password":"password","firstName":"John","lastName":"Doe","birthday":"01/01/1995"}`)
		req, _ = http.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(reqBody))

		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)

		// test with missing fields
		reqBody = []byte(`{"email":"john@example.com","password":"password","firstName":"John","lastName":"Doe"}`)
		req, _ = http.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(reqBody))

		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Test Login
	t.Run("login existing user", func(t *testing.T) {
		reqBody, _ := json.Marshal(map[string]string{
			"email":    user.Email,
			"password": "myPassword123!333#",
		})
		req, _ := http.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(reqBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "token")
	})

	t.Run("login with invalid credentials", func(t *testing.T) {
		// Mocking a wrong password scenario
		wrongUser := user
		wrongUser.PasswordHash = "incorrect_password_hash"

		reqBody := []byte(`{"email":"
		","password":"password123"}`)
		req, _ := http.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(reqBody))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Log in to incorrect user email
	t.Run("login with incorrect email", func(t *testing.T) {
		reqBody := []byte(`{"email":"john@exampelp23.com","password":"password123"}`)
		req, _ := http.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(reqBody))

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Test Delete User
	t.Run("delete existing user", func(t *testing.T) {
		token, _ := utils.GenerateJWT(&user)
		req, _ := http.NewRequest(http.MethodDelete, "/auth/delete", nil)
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	// Test unauthorized delete request
	t.Run("delete user without authorization", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodDelete, "/auth/delete", nil)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)

		// Test with invalid token
		req.Header.Set("Authorization", "Bearer invalid_token")
		w = httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	// Test user not found during delete
	t.Run("delete non-existent user", func(t *testing.T) {
		// Create a new user with a different email
		newUser := user
		newUser.Email = "test@test.com"

		token, _ := utils.GenerateJWT(&newUser)
		req, _ := http.NewRequest(http.MethodDelete, "/auth/delete", nil)
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}
