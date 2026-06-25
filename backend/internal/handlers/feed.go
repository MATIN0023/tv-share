package handlers

import "net/http"

// GetFeed godoc
// @Summary Get public video feed
// @Tags feed
// @Produce json
// @Security BearerAuth
// @Success 200 {array} swaggerVideoFeed
// @Router /api/feed [get]
func (h *Handler) GetFeed(w http.ResponseWriter, r *http.Request) {
	feeds, err := h.Repo.ListPublicVideoFeeds(r.Context(), 50)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to load feed")
		return
	}
	WriteJSON(w, http.StatusOK, feeds)
}

// GetWatchHistory godoc
// @Summary Get authenticated user watch history
// @Tags history
// @Produce json
// @Security BearerAuth
// @Success 200 {array} swaggerWatchHistory
// @Router /api/watch-history [get]
func (h *Handler) GetWatchHistory(w http.ResponseWriter, r *http.Request) {
	history, err := h.Repo.GetWatchHistory(r.Context(), userID(r), 50)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to load watch history")
		return
	}
	WriteJSON(w, http.StatusOK, history)
}

// GetRoomHistory godoc
// @Summary Get rooms from user watch history
// @Tags history
// @Produce json
// @Security BearerAuth
// @Success 200 {array} swaggerRoom
// @Router /api/room-history [get]
func (h *Handler) GetRoomHistory(w http.ResponseWriter, r *http.Request) {
	rooms, err := h.Repo.GetRoomHistory(r.Context(), userID(r), 50)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to load room history")
		return
	}
	WriteJSON(w, http.StatusOK, rooms)
}
