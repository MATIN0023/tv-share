package handlers

import (
	"net/http"

	"watch-party/internal/models"
)

func (h *Handler) GetPublicSettings(w http.ResponseWriter, r *http.Request) {
	s, err := h.Repo.GetSettings(r.Context())
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to load settings")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"site_name":          s.SiteName,
		"announcement_text":  s.AnnouncementText,
		"login_enabled":      s.LoginEnabled,
		"signup_enabled":     s.SignupEnabled,
		"payment_enabled":    s.PaymentEnabled,
		"otp_enabled":        s.OtpEnabled,
		"allow_guest_rooms":  s.AllowGuestRooms,
		"maintenance_mode":   s.MaintenanceMode,
		"max_upload_size_mb": s.MaxUploadSizeMB,
		"support_email":      s.SupportEmail,
		"support_phone":      s.SupportPhone,
	})
}

func (h *Handler) ListMyActivity(w http.ResponseWriter, r *http.Request) {
	page := QueryInt(r, "page", 1)
	limit := QueryInt(r, "limit", 30)
	result, err := h.Repo.ListActivityLogsForUser(r.Context(), userID(r), page, limit)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list activity")
		return
	}
	WriteJSON(w, http.StatusOK, result)
}
