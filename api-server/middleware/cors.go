package middleware

import "github.com/gin-gonic/gin"


func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
        c.Header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    }
}
