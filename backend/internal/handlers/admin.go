package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"watch-party/internal/auth"
	"watch-party/internal/models"
	"watch-party/internal/phone"
	"watch-party/internal/util"
)

func (h *Handler) AdminGetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.Repo.GetAdminStats(r.Context())
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to load stats")
		return
	}
	WriteJSON(w, http.StatusOK, stats)
}

func (h *Handler) AdminListUsers(w http.ResponseWriter, r *http.Request) {
	page := QueryInt(r, "page", 1)
	limit := QueryInt(r, "limit", 20)
	search := r.URL.Query().Get("search")
	result, err := h.Repo.ListUsersPaginated(r.Context(), search, page, limit)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list users")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"items": result.Items,
		"users": result.Items,
		"total": result.Total,
		"page":  result.Page,
		"limit": result.Limit,
	})
}

type adminCreateUserRequest struct {
	PhoneNumber      string `json:"phone_number"`
	Password         string `json:"password"`
	DisplayName      string `json:"display_name"`
	Role             string `json:"role"`
	SubscriptionPlan string `json:"subscription_plan"`
}

func (h *Handler) AdminCreateUser(w http.ResponseWriter, r *http.Request) {
	var req adminCreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	normalized := phone.Normalize(req.PhoneNumber)
	if !phone.Valid(normalized) {
		WriteJSONError(w, http.StatusBadRequest, "Invalid phone number")
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
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	update := bson.M{}
	if req.Role != "" {
		update["role"] = req.Role
	}
	if req.SubscriptionPlan != "" {
		update["subscription_plan"] = req.SubscriptionPlan
	}
	if len(update) > 0 {
		_ = h.Repo.UpdateUser(r.Context(), user.ID.Hex(), update)
		user, _ = h.Repo.GetUserByID(r.Context(), user.ID.Hex())
	}
	_ = h.Repo.WriteActivityLog(r.Context(), auditActor(r), models.RoleAdmin, "user_create", "user", user.ID.Hex(), normalized)
	WriteJSON(w, http.StatusCreated, user)
}

type adminUpdateUserRequest struct {
	DisplayName      string `json:"display_name"`
	PhoneNumber      string `json:"phone_number"`
	Role             string `json:"role"`
	SubscriptionPlan string `json:"subscription_plan"`
	IsActive         *bool  `json:"is_active"`
}

func (h *Handler) AdminUpdateUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if _, err := h.Repo.GetUserByID(r.Context(), id); err != nil {
		WriteJSONError(w, http.StatusNotFound, "User not found")
		return
	}

	var req adminUpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	update := bson.M{}
	if req.DisplayName != "" {
		update["display_name"] = req.DisplayName
	}
	if req.PhoneNumber != "" {
		normalized := phone.Normalize(req.PhoneNumber)
		if !phone.Valid(normalized) {
			WriteJSONError(w, http.StatusBadRequest, "Invalid phone number")
			return
		}
		update["phone_number"] = normalized
	}
	if req.Role != "" {
		update["role"] = req.Role
	}
	if req.SubscriptionPlan != "" {
		update["subscription_plan"] = req.SubscriptionPlan
	}
	if req.IsActive != nil {
		update["is_active"] = *req.IsActive
	}
	if len(update) == 0 {
		WriteJSONError(w, http.StatusBadRequest, "No fields to update")
		return
	}
	if err := h.Repo.UpdateUser(r.Context(), id, update); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update user")
		return
	}
	_ = h.Repo.WriteActivityLog(r.Context(), auditActor(r), models.RoleAdmin, "user_update", "user", id, "")
	user, _ := h.Repo.GetUserByID(r.Context(), id)
	WriteJSON(w, http.StatusOK, user)
}

func (h *Handler) AdminDeleteUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.Repo.DeleteUser(r.Context(), id); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to delete user")
		return
	}
	_ = h.Repo.WriteActivityLog(r.Context(), auditActor(r), models.RoleAdmin, "user_delete", "user", id, "")
	WriteJSON(w, http.StatusOK, map[string]string{"message": "User deleted"})
}

type banUserRequest struct {
	Banned bool `json:"banned"`
}

func (h *Handler) AdminBanUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req banUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if err := h.Repo.SetUserActive(r.Context(), id, !req.Banned); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update user status")
		return
	}
	action := "user_unban"
	if req.Banned {
		action = "user_ban"
	}
	_ = h.Repo.WriteActivityLog(r.Context(), auditActor(r), models.RoleAdmin, action, "user", id, "")
	user, _ := h.Repo.GetUserByID(r.Context(), id)
	WriteJSON(w, http.StatusOK, user)
}

type assignSubscriptionRequest struct {
	PlanSlug  string `json:"plan_slug"`
	ExpiresAt string `json:"expires_at"`
}

func (h *Handler) AdminAssignSubscription(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req assignSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.PlanSlug == "" {
		WriteJSONError(w, http.StatusBadRequest, "plan_slug is required")
		return
	}

	var expires time.Time
	if req.ExpiresAt != "" {
		t, err := time.Parse(time.RFC3339, req.ExpiresAt)
		if err != nil {
			WriteJSONError(w, http.StatusBadRequest, "Invalid expires_at format (use RFC3339)")
			return
		}
		expires = t.UTC()
	} else {
		plan, err := h.Repo.GetPlanBySlug(r.Context(), req.PlanSlug)
		if err != nil {
			WriteJSONError(w, http.StatusBadRequest, "Unknown plan")
			return
		}
		expires = models.NowUTC().AddDate(0, 0, plan.DurationDays)
	}

	if err := h.Repo.SetUserSubscription(r.Context(), id, req.PlanSlug, expires); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to assign subscription")
		return
	}
	user, _ := h.Repo.GetUserByID(r.Context(), id)
	WriteJSON(w, http.StatusOK, user)
}

func (h *Handler) AdminListPlans(w http.ResponseWriter, r *http.Request) {
	plans, err := h.Repo.ListPlans(r.Context())
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list plans")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"plans": plans})
}

type adminPlanRequest struct {
	Slug         string   `json:"slug"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Price        float64  `json:"price"`
	Currency     string   `json:"currency"`
	DurationDays int      `json:"duration_days"`
	Features     []string `json:"features"`
	IsActive     bool     `json:"is_active"`
}

func (h *Handler) AdminCreatePlan(w http.ResponseWriter, r *http.Request) {
	var req adminPlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Name == "" {
		WriteJSONError(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.Slug == "" {
		req.Slug = util.Slugify(req.Name)
	}
	if req.Slug == "" {
		WriteJSONError(w, http.StatusBadRequest, "could not generate slug from name")
		return
	}
	plan := &models.Plan{
		Slug:         req.Slug,
		Name:         req.Name,
		Description:  req.Description,
		Price:        req.Price,
		Currency:     req.Currency,
		DurationDays: req.DurationDays,
		Features:     req.Features,
		IsActive:     req.IsActive,
	}
	if plan.Currency == "" {
		plan.Currency = "IRR"
	}
	if err := h.Repo.CreatePlan(r.Context(), plan); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create plan")
		return
	}
	_ = h.Repo.WriteActivityLog(r.Context(), auditActor(r), models.RoleAdmin, "plan_create", "plan", plan.ID.Hex(), plan.Slug)
	WriteJSON(w, http.StatusCreated, plan)
}

func (h *Handler) AdminUpdatePlan(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req adminPlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	update := bson.M{}
	if req.Name != "" {
		update["name"] = req.Name
	}
	if req.Description != "" {
		update["description"] = req.Description
	}
	if req.Price >= 0 {
		update["price"] = req.Price
	}
	if req.Currency != "" {
		update["currency"] = req.Currency
	}
	if req.DurationDays > 0 {
		update["duration_days"] = req.DurationDays
	}
	if req.Features != nil {
		update["features"] = req.Features
	}
	update["is_active"] = req.IsActive
	if len(update) == 0 {
		WriteJSONError(w, http.StatusBadRequest, "No fields to update")
		return
	}
	if err := h.Repo.UpdatePlan(r.Context(), id, update); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update plan")
		return
	}
	_ = h.Repo.WriteActivityLog(r.Context(), auditActor(r), models.RoleAdmin, "plan_update", "plan", id, "")
	plan, _ := h.Repo.GetPlan(r.Context(), id)
	WriteJSON(w, http.StatusOK, plan)
}

func (h *Handler) AdminListTransactions(w http.ResponseWriter, r *http.Request) {
	page := QueryInt(r, "page", 1)
	limit := QueryInt(r, "limit", 20)
	result, err := h.Repo.ListTransactionsPaginated(r.Context(), page, limit)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list transactions")
		return
	}
	WriteJSON(w, http.StatusOK, result)
}

func (h *Handler) AdminListReports(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	targetType := r.URL.Query().Get("target_type")
	page := QueryInt(r, "page", 1)
	limit := QueryInt(r, "limit", 20)
	result, err := h.Repo.ListReportsPaginated(r.Context(), status, targetType, page, limit)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list reports")
		return
	}
	WriteJSON(w, http.StatusOK, result)
}

func (h *Handler) AdminResolveReport(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	resolverID := auth.UserIDFromContext(r.Context())
	if err := h.Repo.ResolveReport(r.Context(), id, resolverID); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to resolve report")
		return
	}
	_ = h.Repo.WriteActivityLog(r.Context(), auditActor(r), models.RoleAdmin, "report_resolve", "report", id, "")
	WriteJSON(w, http.StatusOK, map[string]string{"message": "Report resolved"})
}

func (h *Handler) AdminListLiveRooms(w http.ResponseWriter, r *http.Request) {
	rooms, err := h.Repo.ListLiveRooms(r.Context())
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list live rooms")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"rooms": rooms})
}

func (h *Handler) AdminDeleteVideo(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.Repo.DeleteVideo(r.Context(), id); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to delete video")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"message": "Video deleted"})
}

func (h *Handler) AdminGetSettings(w http.ResponseWriter, r *http.Request) {
	settings, err := h.Repo.GetSettings(r.Context())
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to load settings")
		return
	}
	WriteJSON(w, http.StatusOK, settings)
}

type adminSettingsRequest struct {
	MaintenanceMode  *bool  `json:"maintenance_mode"`
	LoginEnabled     *bool  `json:"login_enabled"`
	SignupEnabled    *bool  `json:"signup_enabled"`
	PaymentEnabled   *bool  `json:"payment_enabled"`
	OtpEnabled       *bool  `json:"otp_enabled"`
	SiteName         string `json:"site_name"`
	SupportEmail     string `json:"support_email"`
	SupportPhone     string `json:"support_phone"`
	AnnouncementText string `json:"announcement_text"`
	MaxUploadSizeMB  *int   `json:"max_upload_size_mb"`
	AllowGuestRooms  *bool  `json:"allow_guest_rooms"`
}

func (h *Handler) AdminUpdateSettings(w http.ResponseWriter, r *http.Request) {
	var req adminSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	update := bson.M{}
	if req.MaintenanceMode != nil {
		update["maintenance_mode"] = *req.MaintenanceMode
	}
	if req.LoginEnabled != nil {
		update["login_enabled"] = *req.LoginEnabled
	}
	if req.SignupEnabled != nil {
		update["signup_enabled"] = *req.SignupEnabled
	}
	if req.PaymentEnabled != nil {
		update["payment_enabled"] = *req.PaymentEnabled
	}
	if req.OtpEnabled != nil {
		update["otp_enabled"] = *req.OtpEnabled
	}
	if req.SiteName != "" {
		update["site_name"] = req.SiteName
	}
	if req.SupportEmail != "" {
		update["support_email"] = req.SupportEmail
	}
	if req.SupportPhone != "" {
		update["support_phone"] = req.SupportPhone
	}
	if req.AnnouncementText != "" {
		update["announcement_text"] = req.AnnouncementText
	}
	if req.MaxUploadSizeMB != nil {
		update["max_upload_size_mb"] = *req.MaxUploadSizeMB
	}
	if req.AllowGuestRooms != nil {
		update["allow_guest_rooms"] = *req.AllowGuestRooms
	}
	if len(update) == 0 {
		WriteJSONError(w, http.StatusBadRequest, "No fields to update")
		return
	}
	settings, err := h.Repo.UpdateSettings(r.Context(), update)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update settings")
		return
	}
	_ = h.Repo.WriteActivityLog(r.Context(), auditActor(r), models.RoleAdmin, "settings_update", "settings", models.SettingsGlobalID, "")
	WriteJSON(w, http.StatusOK, settings)
}

type maintenanceRequest struct {
	Enabled bool `json:"enabled"`
}

func (h *Handler) AdminSetMaintenance(w http.ResponseWriter, r *http.Request) {
	var req maintenanceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	settings, err := h.Repo.UpdateSettings(r.Context(), bson.M{"maintenance_mode": req.Enabled})
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update maintenance mode")
		return
	}
	_ = h.Repo.WriteAuditLog(r.Context(), auditActor(r), "maintenance_toggle", "settings", models.SettingsGlobalID, fmt.Sprintf("enabled=%v", req.Enabled))
	WriteJSON(w, http.StatusOK, settings)
}

func (h *Handler) AdminListRooms(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	search := r.URL.Query().Get("search")
	page := QueryInt(r, "page", 1)
	limit := QueryInt(r, "limit", 20)
	result, err := h.Repo.ListRoomsPaginated(r.Context(), status, search, page, limit)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list rooms")
		return
	}
	WriteJSON(w, http.StatusOK, result)
}

func (h *Handler) AdminCloseRoom(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.Repo.CloseRoom(r.Context(), id); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to close room")
		return
	}
	_ = h.Repo.WriteAuditLog(r.Context(), auditActor(r), "room_close", "room", id, "")
	WriteJSON(w, http.StatusOK, map[string]string{"message": "Room closed"})
}

func (h *Handler) AdminListLogs(w http.ResponseWriter, r *http.Request) {
	page := QueryInt(r, "page", 1)
	limit := QueryInt(r, "limit", 30)
	result, err := h.Repo.ListAuditLogsPaginated(r.Context(), page, limit)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list logs")
		return
	}
	WriteJSON(w, http.StatusOK, result)
}

type adminResetPasswordRequest struct {
	NewPassword string `json:"new_password"`
}

func (h *Handler) AdminResetUserPassword(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req adminResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if len(req.NewPassword) < 8 {
		WriteJSONError(w, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}
	if err := h.Repo.AdminResetUserPassword(r.Context(), id, req.NewPassword); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to reset password")
		return
	}
	_ = h.Repo.WriteAuditLog(r.Context(), auditActor(r), "user_reset_password", "user", id, "")
	WriteJSON(w, http.StatusOK, map[string]string{"message": "Password reset"})
}

type adminDiscountRequest struct {
	Code            string   `json:"code"`
	Description     string   `json:"description"`
	DiscountType    string   `json:"discount_type"`
	DiscountPercent float64  `json:"discount_percent"`
	DiscountAmount  float64  `json:"discount_amount"`
	MaxUses         int      `json:"max_uses"`
	ValidFrom       string   `json:"valid_from"`
	ValidUntil      string   `json:"valid_until"`
	PlanSlugs       []string `json:"plan_slugs"`
	IsActive        bool     `json:"is_active"`
}

func parseRFC3339Optional(s string) (time.Time, error) {
	if s == "" {
		return time.Time{}, nil
	}
	return time.Parse(time.RFC3339, s)
}

func (h *Handler) AdminListDiscounts(w http.ResponseWriter, r *http.Request) {
	codes, err := h.Repo.ListDiscountCodes(r.Context())
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list discount codes")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"discounts": codes})
}

func (h *Handler) AdminCreateDiscount(w http.ResponseWriter, r *http.Request) {
	var req adminDiscountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Code == "" {
		WriteJSONError(w, http.StatusBadRequest, "code is required")
		return
	}
	validFrom, err := parseRFC3339Optional(req.ValidFrom)
	if err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid valid_from")
		return
	}
	validUntil, err := parseRFC3339Optional(req.ValidUntil)
	if err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid valid_until")
		return
	}
	d := &models.DiscountCode{
		Code:            req.Code,
		Description:     req.Description,
		DiscountType:    req.DiscountType,
		DiscountPercent: req.DiscountPercent,
		DiscountAmount:  req.DiscountAmount,
		MaxUses:         req.MaxUses,
		ValidFrom:       validFrom.UTC(),
		ValidUntil:      validUntil.UTC(),
		PlanSlugs:       req.PlanSlugs,
		IsActive:        req.IsActive,
	}
	if err := h.Repo.CreateDiscountCode(r.Context(), d); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create discount code")
		return
	}
	_ = h.Repo.WriteAuditLog(r.Context(), auditActor(r), "discount_create", "discount", d.ID.Hex(), d.Code)
	WriteJSON(w, http.StatusCreated, d)
}

func (h *Handler) AdminUpdateDiscount(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req adminDiscountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	update := bson.M{"is_active": req.IsActive}
	if req.Code != "" {
		update["code"] = req.Code
	}
	if req.Description != "" {
		update["description"] = req.Description
	}
	if req.DiscountType != "" {
		update["discount_type"] = req.DiscountType
	}
	if req.DiscountPercent > 0 {
		update["discount_percent"] = req.DiscountPercent
	}
	if req.DiscountAmount > 0 {
		update["discount_amount"] = req.DiscountAmount
	}
	if req.MaxUses > 0 {
		update["max_uses"] = req.MaxUses
	}
	if req.ValidFrom != "" {
		t, err := parseRFC3339Optional(req.ValidFrom)
		if err != nil {
			WriteJSONError(w, http.StatusBadRequest, "Invalid valid_from")
			return
		}
		update["valid_from"] = t.UTC()
	}
	if req.ValidUntil != "" {
		t, err := parseRFC3339Optional(req.ValidUntil)
		if err != nil {
			WriteJSONError(w, http.StatusBadRequest, "Invalid valid_until")
			return
		}
		update["valid_until"] = t.UTC()
	}
	if req.PlanSlugs != nil {
		update["plan_slugs"] = req.PlanSlugs
	}
	if err := h.Repo.UpdateDiscountCode(r.Context(), id, update); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update discount code")
		return
	}
	_ = h.Repo.WriteActivityLog(r.Context(), auditActor(r), models.RoleAdmin, "discount_update", "discount", id, "")
	d, _ := h.Repo.GetDiscountByID(r.Context(), id)
	WriteJSON(w, http.StatusOK, d)
}

func (h *Handler) AdminDeleteDiscount(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.Repo.DeleteDiscountCode(r.Context(), id); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to delete discount code")
		return
	}
	_ = h.Repo.WriteAuditLog(r.Context(), auditActor(r), "discount_delete", "discount", id, "")
	WriteJSON(w, http.StatusOK, map[string]string{"message": "Discount deleted"})
}
