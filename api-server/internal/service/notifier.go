package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// NotificationType represents different types of notifications
type NotificationType string

const (
	TypeJobStatus NotificationType = "job_status"
	TypeError     NotificationType = "error"
	TypeHeartbeat NotificationType = "heartbeat"
)

type Notifier interface {
	Start(ctx context.Context)
	Notify(notification Notification) error
	HandleWebSocket(ctx context.Context, w http.ResponseWriter, r *http.Request, ClientID string)
	HandleSSE(ctx context.Context, w http.ResponseWriter, r *http.Request, ClientID string)
}

// Notification represents a message to be sent to clients
type Notification struct {
	Type     NotificationType `json:"type"`
	JobID    string           `json:"job_id"`
	ClientID string           `json:"client_id"`
	Status   string           `json:"status,omitempty"`
	Data     interface{}      `json:"data,omitempty"`
	Error    string           `json:"error,omitempty"`
	Time     time.Time        `json:"time"`
}

// NotificationService manages all client connections and notifications
type NotificationService struct {
	wsClients    map[string]map[*WebSocketClient]bool
	wsRegister   chan *WebSocketClient
	wsUnregister chan *WebSocketClient

	// SSE specific
	sseClients    map[string]map[chan Notification]bool
	sseRegister   chan *SSEClient
	sseUnregister chan *SSEClient

	// Common
	notifications chan Notification
	stop          chan struct{}
	mu            sync.RWMutex
}

// WebSocketClient represents a WebSocket connection
type WebSocketClient struct {
	svc      *NotificationService
	conn     *websocket.Conn
	clientID string
	send     chan Notification
	stopPing chan struct{}
}

// SSEClient represents a Server-Sent Events connection
type SSEClient struct {
	svc      *NotificationService
	clientID string
	send     chan Notification
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// NewNotificationHub creates a new svc instance
func NewNotificationService() *NotificationService {
	return &NotificationService{
		wsClients:     make(map[string]map[*WebSocketClient]bool),
		wsRegister:    make(chan *WebSocketClient),
		wsUnregister:  make(chan *WebSocketClient),
		sseClients:    make(map[string]map[chan Notification]bool),
		sseRegister:   make(chan *SSEClient),
		sseUnregister: make(chan *SSEClient),
		notifications: make(chan Notification, 1000),
		stop:          make(chan struct{}),
	}
}

// Start begins the notification svc's main loop
func (h *NotificationService) Start(ctx context.Context) {
	go func() {
		for {
			select {
			case <-ctx.Done():
				h.stop <- struct{}{}
				return

			case client := <-h.wsRegister:
				h.mu.Lock()
				if _, exists := h.wsClients[client.clientID]; !exists {
					h.wsClients[client.clientID] = make(map[*WebSocketClient]bool)
				}
				h.wsClients[client.clientID][client] = true
				h.mu.Unlock()

			case client := <-h.wsUnregister:
				h.mu.Lock()
				if clients, exists := h.wsClients[client.clientID]; exists {
					if _, ok := clients[client]; ok {
						delete(clients, client)
						close(client.send)
						if len(clients) == 0 {
							delete(h.wsClients, client.clientID)
						}
					}
				}
				h.mu.Unlock()

			case client := <-h.sseRegister:
				h.mu.Lock()
				if _, exists := h.sseClients[client.clientID]; !exists {
					h.sseClients[client.clientID] = make(map[chan Notification]bool)
				}
				h.sseClients[client.clientID][client.send] = true
				h.mu.Unlock()

			case client := <-h.sseUnregister:
				h.mu.Lock()
				if clients, exists := h.sseClients[client.clientID]; exists {
					if _, ok := clients[client.send]; ok {
						delete(clients, client.send)
						close(client.send)
						if len(clients) == 0 {
							delete(h.sseClients, client.clientID)
						}
					}
				}
				h.mu.Unlock()

			case notification := <-h.notifications:
				h.broadcast(notification)
			}
		}
	}()
}

// Notify sends a notification to all clients subscribed to the specified job
func (h *NotificationService) Notify(notification Notification) error {
	select {
	case h.notifications <- notification:
		return nil
	default:
		return fmt.Errorf("notification buffer full")
	}
}

// broadcast sends a notification to all relevant clients
func (h *NotificationService) broadcast(notification Notification) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	// Broadcast to WebSocket clients
	if clients, exists := h.wsClients[notification.ClientID]; exists {
		for client := range clients {
			select {
			case client.send <- notification:
			default:
				close(client.send)
				delete(clients, client)
			}
		}
	}

	// Broadcast to SSE clients
	if clients, exists := h.sseClients[notification.ClientID]; exists {
		for clientChan := range clients {
			select {
			case clientChan <- notification:
			default:
				close(clientChan)
				delete(clients, clientChan)
			}
		}
	}
}

// HandleWebSocket handles WebSocket connections
func (h *NotificationService) HandleWebSocket(ctx context.Context, w http.ResponseWriter, r *http.Request, ClientID string) {

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	defer conn.Close()

	client := &WebSocketClient{
		svc:      h,
		conn:     conn,
		clientID: ClientID,
		send:     make(chan Notification, 256),
		stopPing: make(chan struct{}),
	}

	h.wsRegister <- client

	// Start client goroutines
	go client.writePump()
	go client.readPump()
	go client.pingPump()
}

// HandleSSE handles Server-Sent Events connections
func (h *NotificationService) HandleSSE(context context.Context, w http.ResponseWriter, r *http.Request, clientID string) {

	// Set headers for SSE
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	client := &SSEClient{
		svc:      h,
		clientID: clientID,
		send:     make(chan Notification, 256),
	}

	h.sseRegister <- client

	// Send initial connection established message
	fmt.Fprintf(w, "event: connected\ndata: {\"connected\": true}\n\n")
	if f, ok := w.(http.Flusher); ok {
		f.Flush()
	}

	// Monitor client connection
	notify := r.Context().Done()
	go func() {
		<-notify
		h.sseUnregister <- client
	}()

	// Send notifications to client
	for notification := range client.send {
		data, err := json.Marshal(notification)
		if err != nil {
			log.Printf("Error marshaling SSE notification: %v", err)
			continue
		}

		fmt.Fprintf(w, "event: message\ndata: %s\n\n", data)
		if f, ok := w.(http.Flusher); ok {
			f.Flush()
		}
	}
}

// WebSocket client methods
func (c *WebSocketClient) writePump() {
	ticker := time.NewTicker(time.Second * 54) // Keep-alive ticker
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case notification, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			err := c.conn.WriteJSON(notification)
			if err != nil {
				log.Printf("Error writing to WebSocket: %v", err)
				return
			}

		case <-ticker.C:
			heartbeat := Notification{
				Type: TypeHeartbeat,
				Time: time.Now(),
			}
			if err := c.conn.WriteJSON(heartbeat); err != nil {
				return
			}
		}
	}
}

func (c *WebSocketClient) readPump() {
	defer func() {
		c.svc.wsUnregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(512) // Limit size of incoming messages
	c.conn.SetReadDeadline(time.Now().Add(time.Second * 60))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(time.Second * 60))
		return nil
	})

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
	}
}

func (c *WebSocketClient) pingPump() {
	ticker := time.NewTicker(time.Second * 54)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if err := c.conn.WriteControl(websocket.PingMessage, []byte{}, time.Now().Add(time.Second*10)); err != nil {
				log.Printf("ping error: %v", err)
				return
			}
		case <-c.stopPing:
			return
		}
	}
}

// Example usage in your main application
// func ExampleUsage() {
// 	svc := NewNotificationHub()
// 	ctx := context.Background()
// 	svc.Start(ctx)

// 	// WebSocket endpoint
// 	http.HandleFunc("/ws", svc.HandleWebSocket)

// 	// SSE endpoint
// 	http.HandleFunc("/sse", svc.HandleSSE)

// 	// Example of sending a notification
// 	notification := Notification{
// 		Type:   TypeJobStatus,
// 		JobID:  "job123",
// 		Status: "completed",
// 		Data:   "Transcript generated successfully",
// 		Time:   time.Now(),
// 	}
// 	svc.Notify(notification)
// }
