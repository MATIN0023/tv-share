package handlers

import (
	"encoding/json"
	"net/http"
)

type friendActionRequest struct {
	ToUserID   string `json:"to_user_id"`
	FromUserID string `json:"from_user_id"`
}

// ListFriends godoc
// @Summary List accepted friends
// @Tags friends
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Router /api/friends [get]
func (h *Handler) ListFriends(w http.ResponseWriter, r *http.Request) {
	friends, err := h.Repo.GetFriends(r.Context(), userID(r))
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to get friends")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"friends": friends})
}

// ListFriendRequests godoc
// @Summary List pending friend requests
// @Tags friends
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Router /api/friends/requests [get]
func (h *Handler) ListFriendRequests(w http.ResponseWriter, r *http.Request) {
	pending, err := h.Repo.GetPendingRequests(r.Context(), userID(r))
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to get pending requests")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"pending": pending})
}

// SendFriendRequest godoc
// @Summary Send friend request
// @Tags friends
// @Accept json
// @Security BearerAuth
// @Param body body friendActionRequest true "Target user"
// @Success 201 {object} map[string]string
// @Router /api/friends/requests [post]
func (h *Handler) SendFriendRequest(w http.ResponseWriter, r *http.Request) {
	var req friendActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	uid := userID(r)
	if req.ToUserID == uid {
		WriteJSONError(w, http.StatusBadRequest, "Cannot friend yourself")
		return
	}
	if err := h.Repo.SendFriendRequest(r.Context(), uid, req.ToUserID); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to send request")
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]string{"status": "sent"})
}

// AcceptFriendRequest godoc
// @Summary Accept friend request
// @Tags friends
// @Accept json
// @Security BearerAuth
// @Param body body friendActionRequest true "Requester user ID"
// @Success 200 {object} map[string]string
// @Router /api/friends/requests/accept [put]
func (h *Handler) AcceptFriendRequest(w http.ResponseWriter, r *http.Request) {
	var req friendActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if err := h.Repo.AcceptFriendRequest(r.Context(), req.FromUserID, userID(r)); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to accept")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"status": "accepted"})
}

// RejectFriendRequest godoc
// @Summary Reject friend request
// @Tags friends
// @Accept json
// @Security BearerAuth
// @Param body body friendActionRequest true "Requester user ID"
// @Success 200 {object} map[string]string
// @Router /api/friends/requests/reject [put]
func (h *Handler) RejectFriendRequest(w http.ResponseWriter, r *http.Request) {
	var req friendActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if err := h.Repo.RejectFriendRequest(r.Context(), req.FromUserID, userID(r)); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to reject")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"status": "rejected"})
}
