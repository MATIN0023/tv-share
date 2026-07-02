package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"watch-party/internal/auth"
	"watch-party/internal/models"
)

type googleLoginRequest struct {
	IDToken string `json:"id_token"`
}

type assistantChatRequest struct {
	Message string `json:"message"`
	Locale  string `json:"locale"`
	History []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"history"`
}

type assistantChatResponse struct {
	Reply       string   `json:"reply"`
	Source      string   `json:"source"`
	Suggestions []string `json:"suggestions"`
}

// GoogleLogin verifies a Google ID token and returns a JWT.
func (h *Handler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	if h.GoogleClientID == "" {
		WriteJSONError(w, http.StatusServiceUnavailable, "Google sign-in is not configured")
		return
	}
	if !h.Repo.IsSettingsFlagEnabled(r.Context(), "login_enabled", true) {
		WriteJSONError(w, http.StatusForbidden, "Login is temporarily disabled")
		return
	}

	var req googleLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	info, err := auth.VerifyGoogleIDToken(req.IDToken, h.GoogleClientID)
	if err != nil {
		WriteJSONError(w, http.StatusUnauthorized, "Invalid Google token")
		return
	}

	user, isNew, err := h.Repo.FindOrCreateGoogleUser(r.Context(), info.Sub, info.Email, info.Name, info.Picture)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to authenticate with Google")
		return
	}
	if !user.IsActive {
		WriteJSONError(w, http.StatusForbidden, "Account is suspended")
		return
	}

	_ = h.Repo.TouchLastLogin(r.Context(), user.ID.Hex())
	if isNew {
		_ = h.Repo.WriteActivityLog(r.Context(), user.ID.Hex(), user.Role, "user_register", "user", user.ID.Hex(), "google")
	} else {
		_ = h.Repo.WriteActivityLog(r.Context(), user.ID.Hex(), user.Role, "login", "user", user.ID.Hex(), "google")
	}

	phoneForJWT := user.PhoneNumber
	if phoneForJWT == "" {
		phoneForJWT = "google:" + user.GoogleID
	}
	token, err := h.JWT.Generate(user.ID.Hex(), phoneForJWT, user.Role, user.TokenVersion)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create token")
		return
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"token":        token,
		"user_id":      user.ID.Hex(),
		"phone_number": user.PhoneNumber,
		"display_name": user.DisplayName,
		"role":         user.Role,
		"is_new_user":  isNew,
		"auth_provider": models.AuthProviderGoogle,
	})
}

// AssistantChat proxies chat to the ai-assistant microservice (mock when unavailable).
func (h *Handler) AssistantChat(w http.ResponseWriter, r *http.Request) {
	var req assistantChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Message == "" {
		WriteJSONError(w, http.StatusBadRequest, "message is required")
		return
	}
	if req.Locale == "" {
		req.Locale = "fa"
	}

	uid := userID(r)
	payload, _ := json.Marshal(map[string]interface{}{
		"message":  req.Message,
		"history":  req.History,
		"locale":   req.Locale,
		"user_id":  uid,
	})

	baseURL := h.AssistantServiceURL
	if baseURL == "" {
		baseURL = "http://localhost:8200"
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Post(baseURL+"/chat", "application/json", bytes.NewReader(payload))
	if err != nil {
		WriteJSON(w, http.StatusOK, assistantChatResponse{
			Reply:       fallbackAssistantReply(req.Message, req.Locale),
			Source:      "mock",
			Suggestions: []string{"ساخت اتاق", "ورود OTP", "آپلود ویدیو"},
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		WriteJSON(w, http.StatusOK, assistantChatResponse{
			Reply:       fallbackAssistantReply(req.Message, req.Locale),
			Source:      "mock",
			Suggestions: []string{"Create a room", "OTP login"},
		})
		return
	}

	var out assistantChatResponse
	if err := json.Unmarshal(body, &out); err != nil {
		WriteJSONError(w, http.StatusBadGateway, "Invalid assistant response")
		return
	}
	WriteJSON(w, http.StatusOK, out)
}

func fallbackAssistantReply(message, locale string) string {
	if locale == "en" {
		return "I'm here to help with MovieSync — rooms, login, uploads, and billing. The AI service is starting up; try again in a moment or ask a simple question like \"how do I create a room?\""
	}
	return "من دستیار MovieSync هستم — درباره اتاق، ورود، آپلود و اشتراک کمک می‌کنم. سرویس AI در حال راه‌اندازی است؛ لحظه‌ای بعد دوباره بپرسید یا بگویید «چطور اتاق بسازم؟»"
}
