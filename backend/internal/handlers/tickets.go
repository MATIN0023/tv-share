package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"watch-party/internal/auth"
	"watch-party/internal/models"
)

func (h *Handler) ListTickets(w http.ResponseWriter, r *http.Request) {
	tickets, err := h.Repo.ListTickets(r.Context(), userID(r))
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to list tickets")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{"tickets": tickets})
}

type createTicketRequest struct {
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

func (h *Handler) CreateTicket(w http.ResponseWriter, r *http.Request) {
	var req createTicketRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Subject == "" {
		WriteJSONError(w, http.StatusBadRequest, "subject is required")
		return
	}

	uid, _ := primitive.ObjectIDFromHex(userID(r))
	ticket := &models.Ticket{
		UserID:  uid,
		Subject: req.Subject,
	}
	if err := h.Repo.CreateTicket(r.Context(), ticket); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to create ticket")
		return
	}
	if req.Body != "" {
		msg := &models.TicketMessage{
			TicketID: ticket.ID,
			SenderID: uid,
			Body:     req.Body,
		}
		_ = h.Repo.AddTicketMessage(r.Context(), msg)
	}
	WriteJSON(w, http.StatusCreated, ticket)
}

func (h *Handler) GetTicket(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	ticket, err := h.Repo.GetTicket(r.Context(), id)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Ticket not found")
		return
	}
	if ticket.UserID.Hex() != userID(r) {
		role := auth.RoleFromContext(r.Context())
		if role != models.RoleAdmin && role != models.RoleSuperAdmin {
			WriteJSONError(w, http.StatusForbidden, "Access denied")
			return
		}
	}
	msgs, err := h.Repo.ListTicketMessages(r.Context(), id)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to load messages")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"ticket":   ticket,
		"messages": msgs,
	})
}

type ticketMessageRequest struct {
	Body string `json:"body"`
}

func (h *Handler) AddTicketMessage(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	ticket, err := h.Repo.GetTicket(r.Context(), id)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Ticket not found")
		return
	}
	if ticket.UserID.Hex() != userID(r) {
		WriteJSONError(w, http.StatusForbidden, "Access denied")
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
	}
	if err := h.Repo.AddTicketMessage(r.Context(), msg); err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to add message")
		return
	}
	WriteJSON(w, http.StatusCreated, msg)
}
