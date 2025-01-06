package middleware

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/gin-gonic/gin"
)

// CustomClaims contains custom claims data
type CustomClaims struct {
	Scope string `json:"scope"`
	Email string `json:"email"`
}

// Auth0Config holds Auth0 configuration
type Auth0Config struct {
	Issuer   string
	Audience string
}

func (c CustomClaims) Validate(ctx context.Context) error {
	return nil
}

// NewAuth0Config creates a new Auth0 config from environment variables
func NewAuth0Config() *Auth0Config {
	return &Auth0Config{
		Issuer:   os.Getenv("AUTH0_ISSUER"),
		Audience: os.Getenv("AUTH0_AUDIENCE"),
	}
}

// Auth0Middleware validates Auth0 access tokens
func Auth0Middleware(config *Auth0Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c.Request)
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "No token provided",
			})
			return
		}

		claims, err := validateToken(token, config)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": err.Error(),
			})
			return
		}

		// Store claims in context for later use
		c.Set("user", claims)
		c.Next()
	}
}

// RegisterHandler handles new user registration from Auth0 Actions
// func RegisterHandler(db *Database) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		var user struct {
// 			UserID    string `json:"user_id" binding:"required"`
// 			Email     string `json:"email" binding:"required,email"`
// 			CreatedAt string `json:"created_at" binding:"required"`
// 		}

// 		if err := c.ShouldBindJSON(&user); err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"error": "Invalid request body",
// 			})
// 			return
// 		}

// 		// Validate the token is from Auth0 Management API
// 		token := extractToken(c.Request)
// 		if !isValidManagementToken(token) {
// 			c.JSON(http.StatusUnauthorized, gin.H{
// 				"error": "Invalid management token",
// 			})
// 			return
// 		}

// 		// Check if user already exists
// 		exists, err := db.CheckUserExists(user.UserID)
// 		if err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{
// 				"error": "Database error",
// 			})
// 			return
// 		}

// 		if exists {
// 			c.JSON(http.StatusConflict, gin.H{
// 				"error": "User already exists",
// 			})
// 			return
// 		}

// 		// Create new user in database
// 		if err := db.CreateUser(User{
// 			Auth0ID:   user.UserID,
// 			Email:     user.Email,
// 			CreatedAt: user.CreatedAt,
// 		}); err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{
// 				"error": "Failed to create user",
// 			})
// 			return
// 		}

// 		c.Status(http.StatusCreated)
// 	}
// }

// Example protected handler
func ProtectedHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get claims from context (set by middleware)
		claims, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "No user claims found",
			})
			return
		}

		validatedClaims := claims.(*validator.ValidatedClaims)

		// Access user information
		userID := validatedClaims.RegisteredClaims.Subject

		// Your protected route logic here
		c.JSON(http.StatusOK, gin.H{
			"message": "Protected data",
			"user_id": userID,
		})
	}
}

func extractToken(r *http.Request) string {
	bearToken := r.Header.Get("Authorization")
	strArr := strings.Split(bearToken, " ")
	if len(strArr) == 2 {
		return strArr[1]
	}
	return ""
}

func validateToken(token string, config *Auth0Config) (*validator.ValidatedClaims, error) {
	// Log the configuration
	issuerURL, err := url.Parse("https://" + os.Getenv("AUTH0_DOMAIN") + "/")
	if err != nil {
		return nil, err
	}

	// The JWKS URL should be constructed by the library
	provider := jwks.NewCachingProvider(issuerURL, 15*time.Minute)

	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		config.Issuer,
		[]string{os.Getenv("AUTH0_CLIENT_ID"), os.Getenv("AUTH0_MANGEMENT_AUDIENCE")},
		validator.WithCustomClaims(
			func() validator.CustomClaims {
				return &CustomClaims{}
			},
		),
		validator.WithAllowedClockSkew(time.Minute),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create validator: %w", err)
	}

	// Validate the token
	claims, err := jwtValidator.ValidateToken(context.Background(), token)
	if err != nil {
		return nil, fmt.Errorf("failed to validate token: %w", err)
	}

	// Type-assert claims to ValidatedClaims
	validatedClaims, ok := claims.(*validator.ValidatedClaims)
	if !ok {
		return nil, fmt.Errorf("invalid claims type")
	}

	return validatedClaims, nil
}

func isValidManagementToken(token string) bool {
	// Implement JWT validation for Management API tokens
	// Similar to validateToken but with Management API audience
	return true // Simplified for example
}
