package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/MicahParks/keyfunc"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

// AuthMiddleware initializes and uses JWKS to validate Auth0 JWTs
func AuthMiddleware() gin.HandlerFunc {
	// Initialize the JWKS keyfunc
	jwksURL := fmt.Sprintf("https://%s/.well-known/jwks.json", os.Getenv("AUTH0_DOMAIN"))
	jwks, err := keyfunc.Get(jwksURL, keyfunc.Options{
		RefreshErrorHandler: func(err error) {
			fmt.Printf("Failed to refresh JWKS: %v\n", err)
		},
	})
	if err != nil {
		panic(fmt.Sprintf("Failed to create JWKS from URL %s: %v", jwksURL, err))
	}

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			c.Abort()
			return
		}

		// Extract and parse the token
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader { // Ensure "Bearer " is included
			c.JSON(http.StatusUnauthorized, gin.H{"error": "malformed authorization header"})
			c.Abort()
			return
		}

		// Parse and validate the JWT using jwks.Keyfunc
		token, err := jwt.Parse(tokenStr, jwks.Keyfunc)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token", "details": err.Error()})
			c.Abort()
			return
		}

		// Ensure the token is valid and has claims
		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}

		// Validate audience (aud) and issuer (iss)
		audience := os.Getenv("AUTH0_AUDIENCE")
		issuer := fmt.Sprintf("https://%s/", os.Getenv("AUTH0_DOMAIN"))

		if claims["aud"] != audience {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid audience"})
			c.Abort()
			return
		}

		if claims["iss"] != issuer {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid issuer"})
			c.Abort()
			return
		}

		// Extract useful claims
		auth0ID, ok := claims["sub"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing 'sub' claim"})
			c.Abort()
			return
		}

		email, _ := claims["email"].(string) // Optional
		name, _ := claims["name"].(string)   // Optional

		// Pass claims to the next middleware/handler
		c.Set("auth0_id", auth0ID)
		c.Set("email", email)
		c.Set("name", name)

		c.Next()
	}
}
