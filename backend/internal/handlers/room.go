package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"watch-party/internal/util"
	"watch-party/internal/ws"
)

type createRoomRequest struct {
	Name       string `json:"name"`
	Visibility string `json:"visibility"`
	Background string `json:"background"`
}

type updateRoomVideoRequest struct {
	VideoURL string `json:"video_url"`
}

type seekRequest struct {
	CurrentTime float64 `json:"current_time"`
}

// CreateRoom godoc
// @Summary Create a watch room
// @Tags rooms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body createRoomRequest true "Room payload"
// @Success 201 {object} swaggerRoom
// @Router /api/rooms [post]
func (h *Handler) CreateRoom(w http.ResponseWriter, r *http.Request) {
	var req createRoomRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Visibility == "" {
		req.Visibility = "public"
	}
	if req.Background == "" {
		req.Background = "default"
	}

	room, err := h.Repo.CreateRoom(r.Context(), req.Name, userID(r), req.Visibility, req.Background)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create room")
		return
	}
	h.Hub.AddRoom(room)
	WriteJSON(w, http.StatusCreated, room)
}

// ListRooms godoc
// @Summary List all rooms
// @Tags rooms
// @Produce json
// @Security BearerAuth
// @Success 200 {array} swaggerRoom
// @Router /api/rooms [get]
func (h *Handler) ListRooms(w http.ResponseWriter, r *http.Request) {
	rooms, err := h.Repo.ListRooms(r.Context())
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list rooms")
		return
	}
	WriteJSON(w, http.StatusOK, rooms)
}

// SearchRooms godoc
// @Summary Search rooms
// @Tags rooms
// @Produce json
// @Security BearerAuth
// @Param q query string true "Search query"
// @Success 200 {array} swaggerRoom
// @Router /api/rooms/search [get]
func (h *Handler) SearchRooms(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		WriteJSONError(w, http.StatusBadRequest, "Query parameter required")
		return
	}
	rooms, err := h.Repo.SearchRooms(r.Context(), query)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to search rooms")
		return
	}
	WriteJSON(w, http.StatusOK, rooms)
}

// GetRoom godoc
// @Summary Get room by ID
// @Tags rooms
// @Produce json
// @Security BearerAuth
// @Param id path string true "Room ID"
// @Success 200 {object} swaggerRoom
// @Failure 404 {object} map[string]string
// @Router /api/rooms/{id} [get]
func (h *Handler) GetRoom(w http.ResponseWriter, r *http.Request) {
	roomID := mux.Vars(r)["id"]
	room, err := h.Repo.GetRoom(r.Context(), roomID)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Room not found")
		return
	}
	WriteJSON(w, http.StatusOK, room)
}

// UpdateRoomVideo godoc
// @Summary Set room video URL
// @Tags rooms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Room ID"
// @Param body body updateRoomVideoRequest true "Video URL"
// @Success 200 {object} map[string]string
// @Router /api/rooms/{id}/video [put]
func (h *Handler) UpdateRoomVideo(w http.ResponseWriter, r *http.Request) {
	roomID := mux.Vars(r)["id"]
	uid := userID(r)

	room, err := h.Repo.GetRoom(r.Context(), roomID)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Room not found")
		return
	}
	if room.OwnerID.Hex() != uid {
		WriteJSONError(w, http.StatusForbidden, "Only room owner can update video")
		return
	}

	var req updateRoomVideoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.VideoURL == "" {
		WriteJSONError(w, http.StatusBadRequest, "video_url is required")
		return
	}

	_, _ = h.Repo.CreateVideo(r.Context(), uid, room.Title, req.VideoURL)

	if err := h.Repo.UpdateRoomVideo(r.Context(), roomID, req.VideoURL); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update room")
		return
	}

	if h.Hub.RoomExists(roomID) {
		h.Hub.BroadcastToRoom(roomID, &ws.Message{Type: "video_change", Video: req.VideoURL})
	}
	WriteJSON(w, http.StatusOK, map[string]string{"video_url": req.VideoURL})
}

// CreateInvitation godoc
// @Summary Create room invitation
// @Tags invitations
// @Produce json
// @Security BearerAuth
// @Param id path string true "Room ID"
// @Success 201 {object} map[string]string
// @Router /api/rooms/{id}/invitations [post]
func (h *Handler) CreateInvitation(w http.ResponseWriter, r *http.Request) {
	roomID := mux.Vars(r)["id"]
	code := util.GenerateInviteCode()
	expires := time.Now().UTC().Add(24 * time.Hour)
	if err := h.Repo.CreateInvitation(r.Context(), roomID, code, expires, 1); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create invitation")
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]string{
		"code":    code,
		"expires": expires.Format(time.RFC3339),
		"room_id": roomID,
	})
}

type acceptInviteRequest struct {
	Code string `json:"code"`
}

// AcceptInvitation godoc
// @Summary Accept invitation by code
// @Tags invitations
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body acceptInviteRequest true "Invitation code"
// @Success 200 {object} map[string]string
// @Router /api/invitations/accept [post]
func (h *Handler) AcceptInvitation(w http.ResponseWriter, r *http.Request) {
	var req acceptInviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	inv, err := h.Repo.ValidateInvitation(r.Context(), req.Code)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Invalid or expired invitation")
		return
	}
	if err := h.Repo.UseInvitation(r.Context(), req.Code); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to accept invitation")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"room_id": inv.RoomID.Hex()})
}

// GetRoomMessages godoc
// @Summary Get room chat messages
// @Tags messages
// @Produce json
// @Security BearerAuth
// @Param id path string true "Room ID"
// @Success 200 {array} swaggerMessage
// @Router /api/rooms/{id}/messages [get]
func (h *Handler) GetRoomMessages(w http.ResponseWriter, r *http.Request) {
	roomID := mux.Vars(r)["id"]
	messages, err := h.Repo.GetMessages(r.Context(), roomID, 100)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to load messages")
		return
	}
	WriteJSON(w, http.StatusOK, messages)
}

// PlayVideo godoc
// @Summary Start room playback
// @Tags playback
// @Security BearerAuth
// @Param id path string true "Room ID"
// @Success 200 {object} swaggerRoom
// @Router /api/rooms/{id}/playback/play [post]
func (h *Handler) PlayVideo(w http.ResponseWriter, r *http.Request) {
	h.updatePlayback(w, r, true, false)
}

// PauseVideo godoc
// @Summary Pause room playback
// @Tags playback
// @Security BearerAuth
// @Param id path string true "Room ID"
// @Success 200 {object} swaggerRoom
// @Router /api/rooms/{id}/playback/pause [post]
func (h *Handler) PauseVideo(w http.ResponseWriter, r *http.Request) {
	h.updatePlayback(w, r, false, true)
}

// SeekVideo godoc
// @Summary Seek room playback position
// @Tags playback
// @Accept json
// @Security BearerAuth
// @Param id path string true "Room ID"
// @Param body body seekRequest true "Seek position"
// @Success 200 {object} swaggerRoom
// @Router /api/rooms/{id}/playback/seek [post]
func (h *Handler) SeekVideo(w http.ResponseWriter, r *http.Request) {
	roomID := mux.Vars(r)["id"]
	uid := userID(r)

	var req seekRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	room, err := h.Repo.GetRoom(r.Context(), roomID)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Room not found")
		return
	}
	if room.OwnerID.Hex() != uid {
		WriteJSONError(w, http.StatusForbidden, "Only room owner can control playback")
		return
	}

	room.CurrentTime = req.CurrentTime
	if err := h.Repo.UpdateRoomPlayback(r.Context(), room); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update playback state")
		return
	}
	h.Hub.BroadcastRoomState(roomID)
	WriteJSON(w, http.StatusOK, room)
}

func (h *Handler) updatePlayback(w http.ResponseWriter, r *http.Request, playing, paused bool) {
	roomID := mux.Vars(r)["id"]
	uid := userID(r)

	room, err := h.Repo.GetRoom(r.Context(), roomID)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Room not found")
		return
	}
	if room.OwnerID.Hex() != uid {
		WriteJSONError(w, http.StatusForbidden, "Only room owner can control playback")
		return
	}

	room.IsPlaying = playing
	room.IsPaused = paused
	if err := h.Repo.UpdateRoomPlayback(r.Context(), room); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update playback state")
		return
	}
	h.Hub.BroadcastRoomState(roomID)
	WriteJSON(w, http.StatusOK, room)
}
