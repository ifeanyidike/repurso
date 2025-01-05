package controller

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyidike/improv/internal/service"
)

type NotificationController struct {
	notifier service.Notifier
	logger   *log.Logger
}

func NewNotificationController(notifier service.Notifier) *NotificationController {
	return &NotificationController{
		notifier: notifier,
		logger:   log.New(log.Writer(), "[Notification]", log.LstdFlags),
	}
}

func (n *NotificationController) HandleWebSocket(c *gin.Context) {
	clientID := c.Query("client_id")
	if clientID == "" {
		n.logger.Println("Missing client_id parameter")
		c.AbortWithStatus(400)
		return
	}
	log.Println("In HandleWebSocket Client ID: ", clientID)
	n.notifier.HandleWebSocket(c, c.Writer, c.Request, clientID)
}

func (n *NotificationController) HandleSSE(c *gin.Context) {
	clientID := c.Query("client_id")
	if clientID == "" {
		n.logger.Println("Missing client_id parameter")
		c.AbortWithStatus(400)
		return
	}
	n.notifier.HandleSSE(c, c.Writer, c.Request, clientID)
}

func (n *NotificationController) RegisterRoutes(router *gin.RouterGroup) {
	notificationGroup := router.Group("/notifications")
	{
		notificationGroup.GET("/websocket", n.HandleWebSocket)
		notificationGroup.GET("/sse", n.HandleSSE)
	}
}
