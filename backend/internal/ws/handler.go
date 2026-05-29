package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func Serve(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		_ = conn.Close()
		return
	}

	user, err := hub.repo.GetUserByID(userID)
	if err != nil {
		_ = conn.Close()
		return
	}

	client := &Client{
		hub:      hub,
		conn:     conn,
		send:     make(chan *Message, 256),
		userID:   userID,
		nickname: user.DisplayName,
		userInfo: &UserInfo{
			UserID:    user.ID,
			Username:  user.Username,
			AvatarURL: user.AvatarURL,
			IsActive:  true,
			LastSeen:  time.Now(),
		},
	}

	_, data, err := conn.ReadMessage()
	if err != nil {
		_ = conn.Close()
		return
	}

	var joinMsg Message
	if err := json.Unmarshal(data, &joinMsg); err != nil || joinMsg.Type != "join" || joinMsg.RoomID == "" {
		_ = conn.WriteJSON(Message{Type: "error", Text: "First message must be join with room_id"})
		_ = conn.Close()
		return
	}

	client.roomID = joinMsg.RoomID
	if client.nickname == "" {
		client.nickname = user.DisplayName
	}

	room, err := hub.repo.GetRoom(client.roomID)
	if err != nil {
		_ = conn.WriteJSON(Message{Type: "error", Text: "Room not found"})
		_ = conn.Close()
		return
	}

	hub.AddRoom(room)
	room.IsPlaying = false
	room.CurrentTime = 0
	room.IsPaused = false
	room.Duration = 0
	_ = hub.repo.UpdateRoomPlayback(room)

	_ = hub.repo.RecordWatchHistory(userID, room.ID, room.Name, room.VideoPath)
	hub.register <- client
	hub.BroadcastRoomState(room.ID)

	go client.writePump()
	go client.readPump()
}
