package handlers

import (
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"watch-party/internal/models"
)

type createReportRequest struct {
	TargetType string `json:"target_type"`
	TargetID   string `json:"target_id"`
	Reason     string `json:"reason"`
}

func (h *Handler) CreateReport(w http.ResponseWriter, r *http.Request) {
	var req createReportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.TargetType == "" || req.TargetID == "" || req.Reason == "" {
		WriteJSONError(w, http.StatusBadRequest, "target_type, target_id and reason are required")
		return
	}

	uid, _ := primitive.ObjectIDFromHex(userID(r))
	report := &models.Report{
		ReporterID: uid,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
		Reason:     req.Reason,
		Status:     models.ReportStatusOpen,
	}
	if err := h.Repo.CreateReport(r.Context(), report); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to submit report")
		return
	}
	_ = h.Repo.WriteActivityLog(r.Context(), userID(r), models.RoleUser, "report_create", req.TargetType, req.TargetID, req.Reason)
	WriteJSON(w, http.StatusCreated, report)
}

func (h *Handler) ValidateCoupon(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code     string `json:"code"`
		PlanSlug string `json:"plan_slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	plan, err := h.Repo.GetPlanBySlug(r.Context(), req.PlanSlug)
	if err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Unknown plan")
		return
	}
	result, err := h.Repo.ValidateDiscountCode(r.Context(), req.Code, req.PlanSlug, plan.Price)
	if err != nil {
		WriteJSONError(w, http.StatusBadRequest, err.Error())
		return
	}
	WriteJSON(w, http.StatusOK, result)
}
