package ws

import (
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan *Message
	roomID   string
	userID   string
	nickname string
	userInfo *UserInfo
}

func (c *Client) readPump() {
	defer func() {
		if c.roomID != "" {
			if state, ok := c.hub.rooms[c.roomID]; ok {
				delete(state.Clients, c)
				if len(state.Clients) == 0 {
					delete(c.hub.rooms, c.roomID)
				}
			}
		}
		c.hub.unregister <- c
		_ = c.conn.Close()
	}()

	for {
		_, data, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		var msg Message
		if err := json.Unmarshal(data, &msg); err != nil {
			continue
		}

		switch msg.Type {
		case "chat":
			c.handleChat(&msg)
		case "video_change":
			c.handleVideoChange(&msg)
		case "video_play":
			c.handleVideoPlay()
		case "video_pause":
			c.handleVideoPause()
		case "video_seek":
			c.handleVideoSeek(&msg)
		case "video_ended":
			c.handleVideoEnded()
		case "sync_state", "room_state":
			c.hub.BroadcastRoomState(c.roomID)
		case "get_history":
			c.sendHistory()
		}
	}
}

func (c *Client) writePump() {
	defer func() { _ = c.conn.Close() }()

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

func (c *Client) handleVideoPlay() {
	if c.roomID == "" {
		return
	}
	room, err := c.hub.repo.GetRoom(c.roomID)
	if err != nil {
		return
	}
	room.IsPlaying = true
	room.IsPaused = false
	_ = c.hub.repo.UpdateRoomPlayback(room)
	c.hub.BroadcastRoomState(room.ID)
}

func (c *Client) handleVideoPause() {
	if c.roomID == "" {
		return
	}
	room, err := c.hub.repo.GetRoom(c.roomID)
	if err != nil {
		return
	}
	room.IsPlaying = false
	room.IsPaused = true
	_ = c.hub.repo.UpdateRoomPlayback(room)
	c.hub.BroadcastRoomState(room.ID)
}

func (c *Client) handleVideoSeek(msg *Message) {
	if c.roomID == "" {
		return
	}
	room, err := c.hub.repo.GetRoom(c.roomID)
	if err != nil {
		return
	}
	room.CurrentTime = msg.CurrentTime
	_ = c.hub.repo.UpdateRoomPlayback(room)
	c.hub.BroadcastRoomState(room.ID)
}

func (c *Client) handleVideoEnded() {
	if c.roomID == "" {
		return
	}
	room, err := c.hub.repo.GetRoom(c.roomID)
	if err != nil {
		return
	}
	room.IsPlaying = false
	room.IsPaused = false
	room.CurrentTime = 0
	_ = c.hub.repo.UpdateRoomPlayback(room)
	c.hub.BroadcastRoomState(room.ID)
}

func (c *Client) handleChat(msg *Message) {
	if c.roomID == "" {
		return
	}

	senderName := c.nickname
	if user, err := c.hub.repo.GetUserByID(c.userID); err == nil && user.DisplayName != "" {
		senderName = user.DisplayName
	}

	_, _ = c.hub.repo.SaveMessage(c.roomID, c.userID, senderName, msg.Text)
	msg.From = senderName
	msg.FromID = c.userID
	msg.Time = time.Now().Format("15:04")
	c.hub.BroadcastToRoom(c.roomID, msg)
}

func (c *Client) handleVideoChange(msg *Message) {
	if c.roomID == "" {
		return
	}
	_ = c.hub.repo.UpdateRoomVideo(c.roomID, msg.Video)
	msg.From = c.nickname
	msg.FromID = c.userID
	c.hub.BroadcastToRoom(c.roomID, msg)
}

func (c *Client) sendHistory() {
	messages, _ := c.hub.repo.GetMessages(c.roomID, 100)
	for _, m := range messages {
		c.send <- &Message{
			Type:   "chat",
			Text:   m.Content,
			From:   m.SenderName,
			FromID: m.SenderID,
			Time:   m.Timestamp.Format("15:04"),
		}
	}
}
