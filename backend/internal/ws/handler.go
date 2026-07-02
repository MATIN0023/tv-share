package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"

	"watch-party/internal/auth"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func extractToken(r *http.Request) string {
	if token := r.URL.Query().Get("token"); token != "" {
		return token
	}
	return auth.ExtractBearerToken(r)
}

func Serve(hub *Hub, jwtAuth *auth.JWT, w http.ResponseWriter, r *http.Request) {
	token := extractToken(r)
	if token == "" {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	claims, err := jwtAuth.ParseClaims(token)
	if err != nil || claims.UserID == "" {
		http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
		return
	}

	ctx := r.Context()
	user, err := hub.repo.GetUserByID(ctx, claims.UserID)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if !user.IsActive {
		http.Error(w, "Account suspended", http.StatusForbidden)
		return
	}
	if claims.TokenVersion != user.TokenVersion {
		http.Error(w, "Session expired", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	userID := user.ID.Hex()
	client := &Client{
		hub:      hub,
		conn:     conn,
		send:     make(chan *Message, 256),
		userID:   userID,
		nickname: user.DisplayName,
		userInfo: &UserInfo{
			UserID:    userID,
			Phone:     user.PhoneNumber,
			AvatarURL: user.AvatarURL,
			IsActive:  true,
			LastSeen:  time.Now().UTC(),
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

	room, err := hub.repo.GetRoom(ctx, client.roomID)
	if err != nil {
		_ = conn.WriteJSON(Message{Type: "error", Text: "Room not found"})
		_ = conn.Close()
		return
	}
	if room.Status == "inactive" {
		_ = conn.WriteJSON(Message{Type: "error", Text: "Room is closed"})
		_ = conn.Close()
		return
	}

	hub.AddRoom(room)

	_ = hub.repo.RecordWatchHistory(ctx, userID, room.ID.Hex(), room.Title, room.VideoURL)
	hub.register <- client
	hub.BroadcastRoomState(room.ID.Hex())

	go client.writePump()
	go client.readPump()
}
