package main

import (
	"log"
	"time"
)

type Hub struct {
	rooms      map[string]*Room
	register   chan *Client
	unregister chan *Client
	broadcast  chan *WSMessage
	users      map[string]*Client // user_id -> client (latest)
}

type UserInfo struct {
	UserID    string    `json:"user_id"`
	Username  string    `json:"username"`
	AvatarURL string    `json:"avatar_url"`
	IsActive bool      `json:"is_active"`
	LastSeen  time.Time `json:"last_seen"`
}

func newHub() *Hub {
	hub := &Hub{
		rooms:      make(map[string]*Room),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *WSMessage),
	}
	hub.loadRoomsFromDB()
	return hub
}

func (h *Hub) loadRoomsFromDB() {
	rows, err := db.Query(`
		SELECT id, name, COALESCE(video_path, ''), owner_id, visibility, created_at
		FROM rooms
	`)
	if err != nil {
		log.Println("Failed to load rooms:", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var r Room
		if err := rows.Scan(&r.ID, &r.Name, &r.VideoPath, &r.OwnerID, &r.Visibility, &r.CreatedAt); err == nil {
			r.Clients = make(map[*Client]bool)
			h.rooms[r.ID] = &r
		}
	}
}

func (h *Hub) addRoom(room *Room) {
	if _, ok := h.rooms[room.ID]; !ok {
		room.Clients = make(map[*Client]bool)
		h.rooms[room.ID] = room
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			if client.roomID != "" {
				if room, ok := h.rooms[client.roomID]; ok {
					room.Clients[client] = true
					// Send history
					messages, _ := getMessages(client.roomID, 100)
					for _, msg := range messages {
						client.send <- &WSMessage{
							Type: "chat",
							Text: msg.Content,
							From: msg.SenderName,
							FromID: msg.SenderID,
							Time: msg.Timestamp.Format("15:04"),
						}
					}
				} else {
					client.send <- &WSMessage{Type: "error", Text: "Room not found"}
					client.conn.Close()
				}
			}

		case client := <-h.unregister:
			if client.roomID != "" {
				if room, ok := h.rooms[client.roomID]; ok {
					delete(room.Clients, client)
					if len(room.Clients) == 0 {
						delete(h.rooms, client.roomID)
					}
				}
			}

		case msg := <-h.broadcast:
			if msg.RoomID != "" {
				if room, ok := h.rooms[msg.RoomID]; ok {
					for client := range room.Clients {
						select {
						case client.send <- msg:
						default:
							close(client.send)
							delete(room.Clients, client)
						}
					}
				}
			}
		}
	}
}

func (h *Hub) broadcastRoomState(roomID string) {
	if room, ok := h.rooms[roomID]; ok {
		h.broadcast <- &WSMessage{
			Type: "room_state",
			RoomInfo: room,
		}
	}
}

func (h *Hub) broadcastToRoom(roomID string, msg *WSMessage) {
	msg.RoomID = roomID
	h.broadcast <- msg
}
