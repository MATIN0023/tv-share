package handlers

import (
	"net/http"

	"github.com/gorilla/mux"
)

func (h *Handler) ListNotifications(w http.ResponseWriter, r *http.Request) {
	items, err := h.Repo.ListNotifications(r.Context(), userID(r))
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list notifications")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"notifications": items})
}

func (h *Handler) MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.Repo.MarkNotificationRead(r.Context(), userID(r), id); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to mark notification read")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"message": "Marked as read"})
}

func (h *Handler) MarkAllNotificationsRead(w http.ResponseWriter, r *http.Request) {
	if err := h.Repo.MarkAllNotificationsRead(r.Context(), userID(r)); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to mark notifications read")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"message": "All marked as read"})
}
