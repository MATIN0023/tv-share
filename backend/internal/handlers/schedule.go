package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"watch-party/internal/util"
)

type scheduleVideoRequest struct {
	RoomID      string `json:"room_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	VideoURL    string `json:"video_url"`
	ScheduledAt string `json:"scheduled_at"`
}

// CreateScheduledVideo godoc
// @Summary Schedule a video for a room
// @Tags schedule
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body scheduleVideoRequest true "Schedule payload"
// @Success 201 {object} map[string]string
// @Router /api/schedule [post]
func (h *Handler) CreateScheduledVideo(w http.ResponseWriter, r *http.Request) {
	var req scheduleVideoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.RoomID == "" || req.Title == "" || req.VideoURL == "" || req.ScheduledAt == "" {
		WriteJSONError(w, http.StatusBadRequest, "room_id, title, video_url and scheduled_at are required")
		return
	}

	scheduledFor, err := time.Parse(time.RFC3339, req.ScheduledAt)
	if err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid date/time format")
		return
	}

	if _, err := h.Repo.GetRoom(req.RoomID); err != nil {
		WriteJSONError(w, http.StatusNotFound, "Room not found")
		return
	}

	id := util.GenerateID()
	uid := userID(r)
	if err := h.Repo.CreateScheduledVideo(id, req.RoomID, uid, req.Title, req.Description, req.VideoURL, scheduledFor); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to schedule video")
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]string{
		"id":           id,
		"scheduled_at": req.ScheduledAt,
	})
}

// ListScheduledVideos godoc
// @Summary List scheduled videos for current user
// @Tags schedule
// @Produce json
// @Security BearerAuth
// @Param status query string false "Filter: all, played, pending"
// @Success 200 {array} swaggerScheduledVideo
// @Router /api/schedule [get]
func (h *Handler) ListScheduledVideos(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	scheduled, err := h.Repo.GetScheduledVideos(userID(r), status)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to get scheduled videos")
		return
	}
	WriteJSON(w, http.StatusOK, scheduled)
}

// CompleteScheduledVideo godoc
// @Summary Mark scheduled video as played
// @Tags schedule
// @Security BearerAuth
// @Param id path string true "Schedule ID"
// @Success 200 {object} map[string]string
// @Router /api/schedule/{id}/complete [post]
func (h *Handler) CompleteScheduledVideo(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.Repo.CompleteScheduledVideo(id); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to complete")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"status": "completed", "id": id})
}

// DeleteScheduledVideo godoc
// @Summary Delete a scheduled video
// @Tags schedule
// @Security BearerAuth
// @Param id path string true "Schedule ID"
// @Success 204
// @Router /api/schedule/{id} [delete]
func (h *Handler) DeleteScheduledVideo(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.Repo.DeleteScheduledVideo(id); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to delete")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
