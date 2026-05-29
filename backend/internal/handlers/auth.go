package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"watch-party/internal/auth"
	"watch-party/internal/util"
)

type registerRequest struct {
	Username    string `json:"username"`
	Password    string `json:"password"`
	DisplayName string `json:"display_name"`
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Register godoc
// @Summary Register a new user
// @Tags auth
// @Accept json
// @Produce json
// @Param body body registerRequest true "Registration payload"
// @Success 201 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Router /auth/register [post]
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if len(req.Username) < 3 {
		WriteJSONError(w, http.StatusBadRequest, "Username must be at least 3 characters")
		return
	}
	if len(req.Password) < 6 {
		WriteJSONError(w, http.StatusBadRequest, "Password must be at least 6 characters")
		return
	}
	if _, err := h.Repo.GetUserByUsername(req.Username); err == nil {
		WriteJSONError(w, http.StatusConflict, "Username already taken")
		return
	}

	id := util.GenerateID()
	if err := h.Repo.CreateUser(id, req.Username, req.Password, req.DisplayName); err != nil {
		log.Printf("Failed to create user: %v", err)
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	token, err := h.JWT.Generate(id, req.Username)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create token")
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]string{
		"token":   token,
		"user":    req.Username,
		"user_id": id,
	})
}

// Login godoc
// @Summary Authenticate user
// @Tags auth
// @Accept json
// @Produce json
// @Param body body loginRequest true "Login payload"
// @Success 200 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/login [post]
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.Repo.GetUserByUsername(req.Username)
	if err != nil || !h.Repo.CheckPassword(req.Password, user.PasswordHash) {
		WriteJSONError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	token, err := h.JWT.Generate(user.ID, user.Username)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create token")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{
		"token":        token,
		"user":         user.Username,
		"user_id":      user.ID,
		"display_name": user.DisplayName,
		"avatar":       user.AvatarURL,
	})
}

func userID(r *http.Request) string {
	return auth.UserIDFromContext(r.Context())
}
