package auth

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"watch-party/internal/models"
	"watch-party/internal/phone"
	"watch-party/internal/repository"
)

// Handler serves phone OTP authentication HTTP endpoints.
type Handler struct {
	Repo *repository.Repository
	JWT  *JWT
}

func NewHandler(repo *repository.Repository, jwt *JWT) *Handler {
	return &Handler{Repo: repo, JWT: jwt}
}

type phoneRequest struct {
	PhoneNumber string `json:"phone_number"`
}

type verifyOTPRequest struct {
	PhoneNumber string `json:"phone_number"`
	Code        string `json:"code"`
}

type authResponse struct {
	Token       string `json:"token"`
	UserID      string `json:"user_id"`
	PhoneNumber string `json:"phone_number"`
	DisplayName string `json:"display_name,omitempty"`
	Role        string `json:"role"`
	IsNewUser   bool   `json:"is_new_user,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

// RequestOTP godoc
// @Summary Request a one-time login code
// @Tags auth
// @Accept json
// @Produce json
// @Param body body phoneRequest true "Phone number"
// @Success 200 {object} map[string]string
// @Router /auth/otp/request [post]
func (h *Handler) RequestOTP(w http.ResponseWriter, r *http.Request) {
	if !h.Repo.IsSettingsFlagEnabled(r.Context(), "otp_enabled", true) {
		writeError(w, http.StatusServiceUnavailable, "ورود با کد یکبارمصرف غیرفعال است")
		return
	}
	var req phoneRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	normalized := phone.Normalize(req.PhoneNumber)
	if !phone.Valid(normalized) {
		writeError(w, http.StatusBadRequest, "Invalid phone number format (use 09XXXXXXXXX)")
		return
	}

	code, err := GenerateOTPCode()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to generate OTP")
		return
	}
	if err := h.Repo.SaveOTP(r.Context(), normalized, code); err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to save OTP")
		return
	}

	log.Printf("[OTP] phone=%s code=%s (expires in 5 minutes)", normalized, code)
	writeJSON(w, http.StatusOK, map[string]string{
		"message": "OTP sent",
		"phone":   normalized,
	})
}

// VerifyOTP godoc
// @Summary Verify OTP and receive JWT (auto-registers new users)
// @Tags auth
// @Accept json
// @Produce json
// @Param body body verifyOTPRequest true "Phone and code"
// @Success 200 {object} authResponse
// @Router /auth/otp/verify [post]
func (h *Handler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	var req verifyOTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	normalized := phone.Normalize(req.PhoneNumber)
	if !phone.Valid(normalized) {
		writeError(w, http.StatusBadRequest, "Invalid phone number format")
		return
	}
	if len(req.Code) != 5 {
		writeError(w, http.StatusBadRequest, "OTP must be 5 digits")
		return
	}

	ok, err := h.Repo.VerifyOTP(r.Context(), normalized, req.Code)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to verify OTP")
		return
	}
	if !ok {
		writeError(w, http.StatusUnauthorized, "Invalid or expired OTP")
		return
	}

	isNew := false
	user, err := h.Repo.GetUserByPhone(r.Context(), normalized)
	if err != nil {
		if !errors.Is(err, mongo.ErrNoDocuments) {
			writeError(w, http.StatusInternalServerError, "Failed to lookup user")
			return
		}
		user = &models.User{
			PhoneNumber:      normalized,
			DisplayName:      normalized,
			Role:             models.RoleUser,
			SubscriptionPlan: models.SubscriptionPlanFree,
			IsActive:         true,
		}
		if err := h.Repo.CreateUser(r.Context(), user); err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to create user")
			return
		}
		isNew = true
	}

	if !user.IsActive {
		writeError(w, http.StatusForbidden, "Account is suspended")
		return
	}

	_ = h.Repo.TouchLastLogin(r.Context(), user.ID.Hex())
	token, err := h.JWT.Generate(user.ID.Hex(), user.PhoneNumber, user.Role)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to create token")
		return
	}

	writeJSON(w, http.StatusOK, authResponse{
		Token:       token,
		UserID:      user.ID.Hex(),
		PhoneNumber: user.PhoneNumber,
		DisplayName: user.DisplayName,
		Role:        user.Role,
		IsNewUser:   isNew,
	})
}
