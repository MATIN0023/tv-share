package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"watch-party/internal/models"
)

func (h *Handler) AdminListTickets(w http.ResponseWriter, r *http.Request) {
	page := QueryInt(r, "page", 1)
	limit := QueryInt(r, "limit", 20)
	status := r.URL.Query().Get("status")
	result, err := h.Repo.ListTicketsPaginated(r.Context(), status, page, limit)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list tickets")
		return
	}
	WriteJSON(w, http.StatusOK, result)
}

type adminTicketStatusRequest struct {
	Status string `json:"status"`
}

func (h *Handler) AdminUpdateTicketStatus(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req adminTicketStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Status == "" {
		WriteJSONError(w, http.StatusBadRequest, "status is required")
		return
	}
	if err := h.Repo.UpdateTicketStatus(r.Context(), id, req.Status); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to update ticket")
		return
	}
	_ = h.Repo.WriteAuditLog(r.Context(), auditActor(r), "ticket_status", "ticket", id, req.Status)
	WriteJSON(w, http.StatusOK, map[string]string{"status": req.Status})
}

func (h *Handler) AdminReplyTicket(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	ticket, err := h.Repo.GetTicket(r.Context(), id)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Ticket not found")
		return
	}

	var req ticketMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Body == "" {
		WriteJSONError(w, http.StatusBadRequest, "body is required")
		return
	}

	uid, _ := primitive.ObjectIDFromHex(userID(r))
	msg := &models.TicketMessage{
		TicketID: ticket.ID,
		SenderID: uid,
		Body:     req.Body,
		IsStaff:  true,
	}
	if err := h.Repo.AddTicketMessage(r.Context(), msg); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to add message")
		return
	}
	if ticket.Status == models.TicketStatusOpen {
		_ = h.Repo.UpdateTicketStatus(r.Context(), id, models.TicketStatusInProgress)
	}
	WriteJSON(w, http.StatusCreated, msg)
}
