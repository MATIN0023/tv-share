package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func (h *Handler) ListVideos(w http.ResponseWriter, r *http.Request) {
	videos, err := h.Repo.ListVideosByUploader(r.Context(), userID(r))
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list videos")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"videos": videos})
}

type uploadVideoRequest struct {
	Title       string `json:"title"`
	OriginalURL string `json:"original_url"`
}

func (h *Handler) UploadVideo(w http.ResponseWriter, r *http.Request) {
	var req uploadVideoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Title == "" || req.OriginalURL == "" {
		WriteJSONError(w, http.StatusBadRequest, "title and original_url are required")
		return
	}

	video, err := h.Repo.CreateVideo(r.Context(), userID(r), req.Title, req.OriginalURL)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create video")
		return
	}
	WriteJSON(w, http.StatusCreated, video)
}

func (h *Handler) DeleteVideo(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	video, err := h.Repo.GetVideo(r.Context(), id)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Video not found")
		return
	}
	if video.UploaderID.Hex() != userID(r) {
		WriteJSONError(w, http.StatusForbidden, "Access denied")
		return
	}
	if err := h.Repo.DeleteVideo(r.Context(), id); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to delete video")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"message": "Video deleted"})
}

func (h *Handler) GetVideoStatus(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	video, err := h.Repo.GetVideo(r.Context(), id)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Video not found")
		return
	}
	if video.UploaderID.Hex() != userID(r) {
		WriteJSONError(w, http.StatusForbidden, "Access denied")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"id":             video.ID,
		"process_status": video.ProcessStatus,
		"hls_url":        video.HlsURL,
	})
}
