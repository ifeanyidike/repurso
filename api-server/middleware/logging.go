package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)



func Logging() gin.HandlerFunc {
	return func(c *gin.Context) {
        // Log request details
		startTime := time.Now()
        log.Printf("%s %s %s %s in %v\n", 
			c.ClientIP(), 
			c.Request.Method, 
			c.Request.URL.Path, 
			c.Request.Proto, 
			time.Since(startTime),
		)
        c.Next()
    }
}