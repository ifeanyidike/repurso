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

type NotificationType string

type Notifier interface {
	Start(ctx context.Context)
	Notify(notification Notification) error
	HandleWebSocket(ctx context.Context, w http.ResponseWriter, r *http.Request, ClientID string)
	HandleSSE(ctx context.Context, w http.ResponseWriter, r *http.Request, ClientID string)
}

const (
	TypeJobStatus NotificationType = "job_status"
	TypeError     NotificationType = "error"
	TypeHeartbeat NotificationType = "heartbeat"
)

type Notification struct {
	Type     NotificationType `json:"type"`
	JobID    string           `json:"job_id"`
	ClientID string           `json:"client_id"`
	Status   string           `json:"status,omitempty"`
	Data     interface{}      `json:"data,omitempty"`
	Error    string           `json:"error,omitempty"`
	Time     time.Time        `json:"time"`
}

type NotificationService struct {
	wsClients      map[string]map[*WebSocketClient]bool
	wsSubscribe    chan *WebSocketClient
	wsUnsubscribe  chan *WebSocketClient
	sseClients     map[string]map[chan Notification]bool
	sseSubscribe   chan *SSEClient
	sseUnsubscribe chan *SSEClient
	notifications  chan Notification
	stop           chan struct{}
	mu             sync.RWMutex
}

type WebSocketClient struct {
	svc      *NotificationService
	conn     *websocket.Conn
	clientID string
	send     chan Notification
}

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

// NewNotificationService creates a new service instance
func NewNotificationService() *NotificationService {
	return &NotificationService{
		wsClients:      make(map[string]map[*WebSocketClient]bool),
		wsSubscribe:    make(chan *WebSocketClient),
		wsUnsubscribe:  make(chan *WebSocketClient),
		sseClients:     make(map[string]map[chan Notification]bool),
		sseSubscribe:   make(chan *SSEClient),
		sseUnsubscribe: make(chan *SSEClient),
		notifications:  make(chan Notification, 1000),
		stop:           make(chan struct{}),
	}
}

func (h *NotificationService) Start(ctx context.Context) {
	go func() {
		for {
			select {
			case <-ctx.Done():
				close(h.stop)
				return

			case client := <-h.wsSubscribe:
				h.mu.Lock()
				if _, exists := h.wsClients[client.clientID]; !exists {
					h.wsClients[client.clientID] = make(map[*WebSocketClient]bool)
				}
				h.wsClients[client.clientID][client] = true
				h.mu.Unlock()
				log.Printf("WebSocket client registered: %s", client.clientID)

			case client := <-h.wsUnsubscribe:
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
				log.Printf("WebSocket client unregistered: %s", client.clientID)

			case client := <-h.sseSubscribe:
				h.mu.Lock()
				if _, exists := h.sseClients[client.clientID]; !exists {
					h.sseClients[client.clientID] = make(map[chan Notification]bool)
				}
				h.sseClients[client.clientID][client.send] = true
				h.mu.Unlock()

			case client := <-h.sseUnsubscribe:
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

func (h *NotificationService) Notify(notification Notification) error {
	select {
	case h.notifications <- notification:
		return nil
	case <-time.After(time.Second * 5):
		return fmt.Errorf("notification buffer full or timeout")
	}
}

func (h *NotificationService) broadcast(notification Notification) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	// Broadcast to WebSocket clients
	if clients, exists := h.wsClients[notification.ClientID]; exists {
		for client := range clients {
			select {
			case client.send <- notification:
			default:
				go func(c *WebSocketClient) {
					h.wsUnsubscribe <- c
				}(client)
			}
		}
	}

	// Broadcast to SSE clients
	if clients, exists := h.sseClients[notification.ClientID]; exists {
		for clientChan := range clients {
			select {
			case clientChan <- notification:
			default:
				go func(ch chan Notification) {
					h.sseUnsubscribe <- &SSEClient{clientID: notification.ClientID, send: ch}
				}(clientChan)
			}
		}
	}
}

func (h *NotificationService) HandleWebSocket(ctx context.Context, w http.ResponseWriter, r *http.Request, clientID string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	client := &WebSocketClient{
		svc:      h,
		conn:     conn,
		clientID: clientID,
		send:     make(chan Notification, 256),
	}

	h.wsSubscribe <- client

	// Start client goroutines
	go client.writePump()
	go client.readPump()
}

func (c *WebSocketClient) writePump() {
	ticker := time.NewTicker(time.Second * 54)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case notification, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(time.Second * 10))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}

			data, err := json.Marshal(notification)
			if err != nil {
				return
			}

			if _, err := w.Write(data); err != nil {
				return
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(time.Second * 10))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *WebSocketClient) readPump() {
	defer func() {
		c.svc.wsUnsubscribe <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(4096)
	c.conn.SetReadDeadline(time.Now().Add(time.Second * 60))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(time.Second * 60))
		return nil
	})

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket read error: %v", err)
			}
			break
		}
	}
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

	h.sseSubscribe <- client

	// Send initial connection established message
	fmt.Fprintf(w, "event: connected\ndata: {\"connected\": true}\n\n")
	if f, ok := w.(http.Flusher); ok {
		f.Flush()
	}

	// Monitor client connection
	notify := r.Context().Done()
	go func() {
		<-notify
		h.sseUnsubscribe <- client
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
