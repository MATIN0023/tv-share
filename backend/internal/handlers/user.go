package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

// GetCurrentUser godoc
// @Summary Get authenticated user profile
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} swaggerUser
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/users/me [get]
func (h *Handler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	user, err := h.Repo.GetUserByID(r.Context(), userID(r))
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "User not found")
		return
	}
	WriteJSON(w, http.StatusOK, user)
}

type updateProfileRequest struct {
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
	Email       string `json:"email"`
	FamilyName  string `json:"family_name"`
	Birthday    string `json:"birthday"`
	Gender      string `json:"gender"`
	Phone       string `json:"phone"`
	Country     string `json:"country"`
	City        string `json:"city"`
	Bio         string `json:"bio"`
}

// UpdateProfile godoc
// @Summary Update authenticated user profile
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body updateProfileRequest true "Profile fields"
// @Success 200 {object} swaggerUser
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/users/me [put]
func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	uid := userID(r)
	if _, err := h.Repo.GetUserByID(r.Context(), uid); err != nil {
		WriteJSONError(w, http.StatusNotFound, "User not found")
		return
	}

	var req updateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.Repo.UpdateUserProfile(r.Context(), uid, req.DisplayName, req.AvatarURL, req.Email, req.FamilyName, req.Birthday, req.Gender, req.Phone, req.Country, req.City, req.Bio); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update profile")
		return
	}

	user, err := h.Repo.GetUserByID(r.Context(), uid)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to load profile")
		return
	}
	WriteJSON(w, http.StatusOK, user)
}

// ListUsers godoc
// @Summary List users
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Router /api/users [get]
func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.Repo.ListUsers(r.Context())
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to get users")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"users": users})
}

type changePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	uid := userID(r)
	user, err := h.Repo.GetUserByID(r.Context(), uid)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "User not found")
		return
	}

	var req changePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if len(req.NewPassword) < 8 {
		WriteJSONError(w, http.StatusBadRequest, "New password must be at least 8 characters")
		return
	}
	if !h.Repo.CheckPassword(req.CurrentPassword, user.PasswordHash) {
		WriteJSONError(w, http.StatusUnauthorized, "Current password is incorrect")
		return
	}
	if err := h.Repo.UpdateUserPassword(r.Context(), uid, req.NewPassword); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update password")
		return
	}
	_ = h.Repo.InvalidateUserSessions(r.Context(), uid)
	_ = h.Repo.WriteActivityLog(r.Context(), uid, user.Role, "password_change", "user", uid, "")
	WriteJSON(w, http.StatusOK, map[string]string{"message": "Password updated"})
}

type avatarRequest struct {
	AvatarURL string `json:"avatar_url"`
}

func (h *Handler) UpdateAvatar(w http.ResponseWriter, r *http.Request) {
	uid := userID(r)
	var req avatarRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.AvatarURL == "" {
		WriteJSONError(w, http.StatusBadRequest, "avatar_url is required")
		return
	}
	if err := h.Repo.UpdateUserAvatar(r.Context(), uid, req.AvatarURL); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update avatar")
		return
	}
	user, _ := h.Repo.GetUserByID(r.Context(), uid)
	WriteJSON(w, http.StatusOK, user)
}

func (h *Handler) BlockUser(w http.ResponseWriter, r *http.Request) {
	targetID := mux.Vars(r)["id"]
	if targetID == userID(r) {
		WriteJSONError(w, http.StatusBadRequest, "Cannot block yourself")
		return
	}
	if err := h.Repo.BlockUser(r.Context(), userID(r), targetID); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to block user")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"message": "User blocked"})
}

func (h *Handler) ListBlockedUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.Repo.ListBlockedUsers(r.Context(), userID(r))
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list blocked users")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"users": users})
}
