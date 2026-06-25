package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"watch-party/internal/auth"
	"watch-party/internal/phone"
)

type registerRequest struct {
	PhoneNumber string `json:"phone_number"`
	Password    string `json:"password"`
	DisplayName string `json:"display_name"`
}

type loginRequest struct {
	PhoneNumber string `json:"phone_number"`
	Password    string `json:"password"`
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	if !h.Repo.IsSettingsFlagEnabled(r.Context(), "signup_enabled", true) {
		WriteJSONError(w, http.StatusForbidden, "ثبت‌نام موقتاً غیرفعال است")
		return
	}
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	normalized := phone.Normalize(req.PhoneNumber)
	if !phone.Valid(normalized) {
		WriteJSONError(w, http.StatusBadRequest, "Invalid phone number format (use 09XXXXXXXXX)")
		return
	}
	if len(req.Password) < 8 {
		WriteJSONError(w, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}
	if _, err := h.Repo.GetUserByPhone(r.Context(), normalized); err == nil {
		WriteJSONError(w, http.StatusConflict, "Phone number already registered")
		return
	} else if err != mongo.ErrNoDocuments {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to check phone")
		return
	}

	displayName := req.DisplayName
	if displayName == "" {
		displayName = normalized
	}

	user, err := h.Repo.CreateUserWithPassword(r.Context(), normalized, req.Password, displayName)
	if err != nil {
		log.Printf("Failed to create user: %v", err)
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	token, err := h.JWT.Generate(user.ID.Hex(), user.PhoneNumber, user.Role)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create token")
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]string{
		"token":        token,
		"phone_number": user.PhoneNumber,
		"user_id":      user.ID.Hex(),
		"display_name": user.DisplayName,
		"role":         user.Role,
	})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if !h.Repo.IsSettingsFlagEnabled(r.Context(), "login_enabled", true) {
		WriteJSONError(w, http.StatusForbidden, "ورود موقتاً غیرفعال است")
		return
	}
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	normalized := phone.Normalize(req.PhoneNumber)
	if !phone.Valid(normalized) {
		WriteJSONError(w, http.StatusBadRequest, "Invalid phone number format")
		return
	}

	user, err := h.Repo.GetUserByPhone(r.Context(), normalized)
	if err != nil {
		WriteJSONError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}
	if !user.IsActive {
		WriteJSONError(w, http.StatusForbidden, "Account is suspended")
		return
	}
	if !h.Repo.CheckPassword(req.Password, user.PasswordHash) {
		WriteJSONError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	_ = h.Repo.TouchLastLogin(r.Context(), user.ID.Hex())
	_ = h.Repo.WriteActivityLog(r.Context(), user.ID.Hex(), user.Role, "login", "user", user.ID.Hex(), "")

	token, err := h.JWT.Generate(user.ID.Hex(), user.PhoneNumber, user.Role)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create token")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{
		"token":        token,
		"phone_number": user.PhoneNumber,
		"user_id":      user.ID.Hex(),
		"display_name": user.DisplayName,
		"avatar":       user.AvatarURL,
		"role":         user.Role,
	})
}

func userID(r *http.Request) string {
	return auth.UserIDFromContext(r.Context())
}
