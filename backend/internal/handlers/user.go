package handlers

import (
	"encoding/json"
	"net/http"
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
	user, err := h.Repo.GetUserByID(userID(r))
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
	if _, err := h.Repo.GetUserByID(uid); err != nil {
		WriteJSONError(w, http.StatusNotFound, "User not found")
		return
	}

	var req updateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.Repo.UpdateUserProfile(uid, req.DisplayName, req.AvatarURL, req.Email, req.FamilyName, req.Birthday, req.Gender, req.Phone, req.Country, req.City, req.Bio); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update profile")
		return
	}

	user, err := h.Repo.GetUserByID(uid)
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
	users, err := h.Repo.ListUsers()
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to get users")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"users": users})
}
