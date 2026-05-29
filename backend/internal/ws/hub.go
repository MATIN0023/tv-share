package ws

import (
	"log"

	"watch-party/internal/models"
	"watch-party/internal/repository"
)

type roomState struct {
	Room    models.Room
	Clients map[*Client]bool
}

type Hub struct {
	repo       *repository.Repository
	rooms      map[string]*roomState
	register   chan *Client
	unregister chan *Client
	broadcast  chan *Message
}

func NewHub(repo *repository.Repository) *Hub {
	h := &Hub{
		repo:       repo,
		rooms:      make(map[string]*roomState),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *Message),
	}
	h.loadRoomsFromDB()
	return h
}

func (h *Hub) loadRoomsFromDB() {
	rooms, err := h.repo.ListRooms()
	if err != nil {
		log.Println("Failed to load rooms:", err)
		return
	}
	for _, room := range rooms {
		h.rooms[room.ID] = &roomState{Room: room, Clients: make(map[*Client]bool)}
	}
}

func (h *Hub) AddRoom(room *models.Room) {
	if _, ok := h.rooms[room.ID]; !ok {
		h.rooms[room.ID] = &roomState{Room: *room, Clients: make(map[*Client]bool)}
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			if client.roomID == "" {
				continue
			}
			state, ok := h.rooms[client.roomID]
			if !ok {
				client.send <- &Message{Type: "error", Text: "Room not found"}
				_ = client.conn.Close()
				continue
			}
			state.Clients[client] = true
			messages, _ := h.repo.GetMessages(client.roomID, 100)
			for _, msg := range messages {
				client.send <- &Message{
					Type:   "chat",
					Text:   msg.Content,
					From:   msg.SenderName,
					FromID: msg.SenderID,
					Time:   msg.Timestamp.Format("15:04"),
				}
			}

		case client := <-h.unregister:
			if client.roomID == "" {
				continue
			}
			if state, ok := h.rooms[client.roomID]; ok {
				delete(state.Clients, client)
				if len(state.Clients) == 0 {
					delete(h.rooms, client.roomID)
				}
			}

		case msg := <-h.broadcast:
			if msg.RoomID == "" {
				continue
			}
			state, ok := h.rooms[msg.RoomID]
			if !ok {
				continue
			}
			for client := range state.Clients {
				select {
				case client.send <- msg:
				default:
					close(client.send)
					delete(state.Clients, client)
				}
			}
		}
	}
}

func (h *Hub) BroadcastRoomState(roomID string) {
	state, ok := h.rooms[roomID]
	if !ok {
		return
	}
	room, err := h.repo.GetRoom(roomID)
	if err == nil {
		state.Room = *room
	}
	h.broadcast <- &Message{Type: "room_state", RoomInfo: &state.Room}
}

func (h *Hub) BroadcastToRoom(roomID string, msg *Message) {
	msg.RoomID = roomID
	h.broadcast <- msg
}

func (h *Hub) RoomExists(roomID string) bool {
	_, ok := h.rooms[roomID]
	return ok
}
