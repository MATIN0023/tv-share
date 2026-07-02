package handlers

import (
	"net/http"

	"watch-party/internal/auth"
	"watch-party/internal/models"
)

func isRoomClosed(room *models.Room) bool {
	return room.Status == models.RoomStatusInactive
}

func isAdminRequest(r *http.Request) bool {
	return models.IsAdminRole(auth.RoleFromContext(r.Context()))
}

func (h *Handler) requireActiveRoom(w http.ResponseWriter, r *http.Request, roomID string) (*models.Room, bool) {
	room, err := h.Repo.GetRoom(r.Context(), roomID)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Room not found")
		return nil, false
	}
	if isRoomClosed(room) && !isAdminRequest(r) {
		WriteJSONError(w, http.StatusGone, "Room is closed")
		return nil, false
	}
	return room, true
}
