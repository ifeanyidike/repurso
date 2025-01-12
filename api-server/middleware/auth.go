package middleware

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/gin-gonic/gin"
)

type CustomClaims struct {
	Scope string `json:"scope"`
	Email string `json:"email"`
}

type Auth0Config struct {
	Issuer   string
	Audience string
	Domain   string
	ClientID string
}

func (c CustomClaims) Validate(ctx context.Context) error {
	return nil
}

// NewAuth0Config creates a new Auth0 config from environment variables
func NewAuth0Config() *Auth0Config {
	return &Auth0Config{
		Issuer:   os.Getenv("AUTH0_ISSUER"),
		Audience: os.Getenv("AUTH0_MANGEMENT_AUDIENCE"),
		Domain:   os.Getenv("AUTH0_DOMAIN"),
		ClientID: os.Getenv("AUTH0_CLIENT_ID"),
	}
}

// Auth0Middleware validates Auth0 access tokens
func Auth0Middleware(config *Auth0Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c.Request)
		if token == "" {
			log.Println("No token provided")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "No token provided",
			})
			return
		}

		claims, err := validateToken(token, config)

		if err != nil {
			log.Println("Claims error ", err)
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

func ProtectedHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
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
	issuerURL, err := url.Parse("https://" + config.Domain + "/")
	if err != nil {
		return nil, err
	}

	provider := jwks.NewCachingProvider(issuerURL, 15*time.Minute)

	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		config.Issuer,
		[]string{config.ClientID, config.Audience},
		validator.WithCustomClaims(
			func() validator.CustomClaims {
				return &CustomClaims{}
			},
		),
		validator.WithAllowedClockSkew(time.Minute),
	)
	if err != nil {
		log.Println("Failed to create validator", err)
		return nil, fmt.Errorf("failed to create validator: %w", err)
	}

	// Validate the token
	claims, err := jwtValidator.ValidateToken(context.Background(), token)
	if err != nil {
		log.Println("Failed to validate token", err)
		return nil, fmt.Errorf("failed to validate token: %w", err)
	}

	// Type-assert claims to ValidatedClaims
	validatedClaims, ok := claims.(*validator.ValidatedClaims)
	if !ok {
		log.Println("Invalid claims type")
		return nil, fmt.Errorf("invalid claims type")
	}

	return validatedClaims, nil
}
