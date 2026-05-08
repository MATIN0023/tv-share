package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	hub     *Hub
	conn    *websocket.Conn
	send    chan *WSMessage
	roomID  string
	userID  string
	nickname string
	userInfo *UserInfo
}

type WSMessage struct {
	Type       string    `json:"type"`
	Text       string    `json:"text,omitempty"`
	From       string    `json:"from,omitempty"`
	FromID     string    `json:"from_id,omitempty"`
	Time       string    `json:"time,omitempty"`
	RoomID     string    `json:"room_id,omitempty"`
	Video      string    `json:"video,omitempty"`
	IsPlaying  bool   `json:"is_playing,omitempty"`
	CurrentTime float64 `json:"current_time,omitempty"`
	Duration   float64 `json:"duration,omitempty"`
	UserInfo   *UserInfo `json:"user_info,omitempty"`
	RoomInfo   *Room    `json:"room_info,omitempty"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		conn.Close()
		return
	}

	user, err := getUserByID(userID)
	if err != nil {
		log.Printf("User not found: %v, error: %v", userID, err)
		conn.Close()
		return
	}

	userInfo := &UserInfo{
		UserID:    user.ID,
		Username:  user.Username,
		AvatarURL: user.AvatarURL,
		IsActive: true,
		LastSeen: time.Now(),
	}

	client := &Client{
		hub:     hub,
		conn:    conn,
		send:    make(chan *WSMessage, 256),
		userID:  userID,
		nickname: user.DisplayName,
		userInfo: userInfo,
	}

	// Update user in hub
	hub.register <- client

	// Read join message
	_, data, err := conn.ReadMessage()
	if err != nil {
		conn.Close()
		return
	}

	var msg WSMessage
	json.Unmarshal(data, &msg)
	if msg.Type != "join" || msg.RoomID == "" {
		conn.WriteJSON(WSMessage{Type: "error", Text: "First message must be join with room_id"})
		conn.Close()
		return
	}

	client.roomID = msg.RoomID
	if client.nickname == "" {
		client.nickname = user.DisplayName
	}

	// Verify room exists
	room, err := getRoom(client.roomID)
	if err != nil {
		conn.WriteJSON(WSMessage{Type: "error", Text: "Room not found"})
		conn.Close()
		return
	}

	// Update room playback state
	room.IsPlaying = false
	room.CurrentTime = 0
	room.IsPaused = false
	room.Duration = 0
	updateRoomPlayback(room.ID)

	// Record watch history
	recordWatchHistory(userID, room.ID, room.Name, room.VideoPath)

	// Broadcast current room state to all
	hub.broadcastRoomState(room.ID)

go client.writePump()
  go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		if c.roomID != "" {
			if room, ok := c.hub.rooms[c.roomID]; ok {
				delete(room.Clients, c)
				if len(room.Clients) == 0 {
					delete(c.hub.rooms, c.roomID)
				}
			}
		}
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, data, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		var msg WSMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			continue
		}

		switch msg.Type {
		case "chat":
			c.handleChat(&msg)
		case "video_change":
			c.handleVideoChange(&msg)
		case "video_play":
			c.handleVideoPlay(&msg)
		case "video_pause":
			c.handleVideoPause(&msg)
		case "video_seek":
			c.handleVideoSeek(&msg)
		case "video_ended":
			c.handleVideoEnded(&msg)
		case "sync_state":
			c.handleSyncState(&msg)
		case "room_state":
			c.handleRoomState(&msg)
		case "get_history":
			c.sendHistory()
		}
	}
}

func (c *Client) handleVideoPlay(msg *WSMessage) {
	if c.roomID == "" {
		return
	}

	if room, err := getRoom(c.roomID); err == nil {
		room.IsPlaying = true
		room.IsPaused = false
		updateRoomPlayback(room.ID)
		c.hub.broadcastRoomState(room.ID)
	}
}

func (c *Client) handleVideoPause(msg *WSMessage) {
	if c.roomID == "" {
		return
	}

	if room, err := getRoom(c.roomID); err == nil {
		room.IsPlaying = false
		room.IsPaused = true
		updateRoomPlayback(room.ID)
		c.hub.broadcastRoomState(room.ID)
	}
}

func (c *Client) handleVideoSeek(msg *WSMessage) {
	if c.roomID == "" {
		return
	}

	if room, err := getRoom(c.roomID); err == nil {
		room.CurrentTime = msg.CurrentTime
		updateRoomPlayback(room.ID)
		c.hub.broadcastRoomState(room.ID)
	}
}

func (c *Client) handleVideoEnded(msg *WSMessage) {
	if c.roomID == "" {
		return
	}

	if room, err := getRoom(c.roomID); err == nil {
		room.IsPlaying = false
		room.IsPaused = false
		room.CurrentTime = 0
		updateRoomPlayback(room.ID)
		c.hub.broadcastRoomState(room.ID)
	}
}

func (c *Client) handleSyncState(msg *WSMessage) {
	if c.roomID == "" {
		return
	}

	if msg.RoomInfo != nil {
		c.hub.broadcastRoomState(c.roomID)
	}
}

func (c *Client) handleRoomState(msg *WSMessage) {
	if c.roomID == "" {
		return
	}

	if msg.RoomInfo != nil {
		// Update local room state
		c.send <- msg
	}
}

func (c *Client) handleChat(msg *WSMessage) {
	if c.roomID == "" {
		return
	}

	// Get user name
	user, _ := getUserByID(c.userID)
	senderName := c.nickname
	if user != nil && user.DisplayName != "" {
		senderName = user.DisplayName
	}

	// Save to DB
	saveMessage(c.roomID, c.userID, senderName, msg.Text)

	// Broadcast
	msg.From = senderName
	msg.FromID = c.userID
	msg.Time = time.Now().Format("15:04")
	c.hub.broadcastToRoom(c.roomID, msg)
}

func (c *Client) handleVideoChange(msg *WSMessage) {
	if c.roomID == "" {
		return
	}

	updateRoomVideo(c.roomID, msg.Video)
	msg.From = c.nickname
	msg.FromID = c.userID
	c.hub.broadcastToRoom(c.roomID, msg)
}

func (c *Client) sendHistory() {
	messages, _ := getMessages(c.roomID, 100)
	for _, m := range messages {
		c.send <- &WSMessage{
			Type: "chat",
			Text: m.Content,
			From: m.SenderName,
			FromID: m.SenderID,
			Time: m.Timestamp.Format("15:04"),
		}
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for msg := range c.send {
		data, err := json.Marshal(msg)
		if err != nil {
			break
		}
		if err := c.conn.WriteMessage(websocket.TextMessage, data); err != nil {
			break
		}
	}
}
