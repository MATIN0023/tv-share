package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"watch-party/internal/models"
	"watch-party/internal/util"
)

func (h *Handler) ListPlans(w http.ResponseWriter, r *http.Request) {
	plans, err := h.Repo.ListPlans(r.Context())
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list plans")
		return
	}
	active := make([]models.Plan, 0, len(plans))
	for _, p := range plans {
		if p.IsActive {
			active = append(active, p)
		}
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"plans": active})
}

func (h *Handler) GetSubscription(w http.ResponseWriter, r *http.Request) {
	user, err := h.Repo.GetUserByID(r.Context(), userID(r))
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "User not found")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"plan":                    user.SubscriptionPlan,
		"subscription_expires_at": user.SubscriptionExpiresAt,
	})
}

func (h *Handler) ListUserTransactions(w http.ResponseWriter, r *http.Request) {
	txs, err := h.Repo.ListTransactionsByUser(r.Context(), userID(r))
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list transactions")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"transactions": txs})
}

type upgradeRequest struct {
	PlanSlug     string `json:"plan_slug"`
	DiscountCode string `json:"discount_code"`
}

func (h *Handler) UpgradeSubscription(w http.ResponseWriter, r *http.Request) {
	var req upgradeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.PlanSlug == "" {
		WriteJSONError(w, http.StatusBadRequest, "plan_slug is required")
		return
	}
	if !h.Repo.IsSettingsFlagEnabled(r.Context(), "payment_enabled", true) {
		WriteJSONError(w, http.StatusServiceUnavailable, "پرداخت آنلاین موقتاً غیرفعال است")
		return
	}
	plan, err := h.Repo.GetPlanBySlug(r.Context(), req.PlanSlug)
	if err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Unknown plan")
		return
	}
	if !plan.IsActive {
		WriteJSONError(w, http.StatusBadRequest, "Plan is not available")
		return
	}
	if plan.Slug == models.SubscriptionPlanFree {
		WriteJSONError(w, http.StatusBadRequest, "پلن رایگان نیاز به پرداخت ندارد")
		return
	}

	amount := plan.Price
	discountAmount := 0.0
	if req.DiscountCode != "" {
		v, err := h.Repo.ValidateDiscountCode(r.Context(), req.DiscountCode, plan.Slug, plan.Price)
		if err != nil {
			WriteJSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		amount = v.FinalAmount
		discountAmount = plan.Price - amount
		req.DiscountCode = v.Code
	}

	gatewayRef := fmt.Sprintf("pay_%s", primitive.NewObjectID().Hex())
	tx, err := h.Repo.CreateTransaction(r.Context(), userID(r), amount, plan.Slug, gatewayRef, req.DiscountCode, discountAmount)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create transaction")
		return
	}
	_ = h.Repo.WriteActivityLog(r.Context(), userID(r), models.RoleUser, "subscription_checkout", "plan", plan.Slug, fmt.Sprintf("%.0f", amount))
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"transaction":  tx,
		"payment_url":  fmt.Sprintf("/pay/%s", gatewayRef),
		"gateway_reference": gatewayRef,
	})
}

type paymentWebhookRequest struct {
	GatewayReference string `json:"gateway_reference"`
	Status           string `json:"status"`
}

func (h *Handler) PaymentWebhook(w http.ResponseWriter, r *http.Request) {
	if h.PaymentWebhookSecret == "" {
		WriteJSONError(w, http.StatusServiceUnavailable, "Payment webhook is not configured")
		return
	}

	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	signature := r.Header.Get("X-Payment-Signature")
	if !util.VerifyHMACHex(body, h.PaymentWebhookSecret, signature) {
		WriteJSONError(w, http.StatusUnauthorized, "Invalid webhook signature")
		return
	}

	var req paymentWebhookRequest
	if err := json.Unmarshal(body, &req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.GatewayReference == "" {
		WriteJSONError(w, http.StatusBadRequest, "gateway_reference is required")
		return
	}

	if req.Status == models.TransactionStatusFailed {
		tx, err := h.Repo.GetTransactionByGatewayRef(r.Context(), req.GatewayReference)
		if err != nil {
			WriteJSONError(w, http.StatusNotFound, "Transaction not found")
			return
		}
		_ = h.Repo.UpdateTransactionStatus(r.Context(), tx.ID.Hex(), models.TransactionStatusFailed)
		WriteJSON(w, http.StatusOK, map[string]string{"message": "Transaction marked failed"})
		return
	}

	tx, err := h.Repo.CompleteTransaction(r.Context(), req.GatewayReference)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Transaction not found")
		return
	}
	_ = h.Repo.WriteActivityLog(r.Context(), tx.UserID.Hex(), models.RoleUser, "subscription_upgrade", "plan", tx.PlanSlug, fmt.Sprintf("%.0f", tx.Amount))
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"message":     "Payment processed",
		"transaction": tx,
	})
}
