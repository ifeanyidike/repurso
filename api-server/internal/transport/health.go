package transport

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// func (app *application) healthCheckHandler(w http.ResponseWriter, r *http.Request) {
// 	w.WriteHeader(http.StatusOK)
//     w.Write([]byte("Healthy"))
// }


func (app *Application) healthCheckHandler(c *gin.Context) {
	c.String(http.StatusOK, "Healthy")
}