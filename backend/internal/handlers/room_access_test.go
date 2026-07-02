package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"watch-party/internal/auth"
	"watch-party/internal/models"
)

func TestIsRoomClosed(t *testing.T) {
	if !isRoomClosed(&models.Room{Status: models.RoomStatusInactive}) {
		t.Error("inactive room should be closed")
	}
	if isRoomClosed(&models.Room{Status: models.RoomStatusActive}) {
		t.Error("active room should not be closed")
	}
	if isRoomClosed(&models.Room{Status: ""}) {
		t.Error("empty status treated as open")
	}
}

func TestIsAdminRequest(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	if isAdminRequest(req) {
		t.Error("no role in context should not be admin")
	}

	ctx := auth.WithRole(req.Context(), models.RoleAdmin)
	req = req.WithContext(ctx)
	if !isAdminRequest(req) {
		t.Error("admin role should be detected")
	}

	ctx = auth.WithRole(req.Context(), models.RoleUser)
	req = req.WithContext(ctx)
	if isAdminRequest(req) {
		t.Error("user role should not be admin")
	}
}

func TestSearchRooms_EmptyQuery(t *testing.T) {
	h := &Handler{}
	req := httptest.NewRequest(http.MethodGet, "/api/rooms/search", nil)
	w := httptest.NewRecorder()

	h.SearchRooms(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400", w.Code)
	}
	var body map[string]string
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body["error"] == "" {
		t.Error("expected error message")
	}
}

func TestAcceptInvitation_EmptyCode(t *testing.T) {
	h := &Handler{}
	body := bytes.NewBufferString(`{"code":""}`)
	req := httptest.NewRequest(http.MethodPost, "/api/invitations/accept", body)
	w := httptest.NewRecorder()

	h.AcceptInvitation(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400", w.Code)
	}
}

func TestAcceptInvitation_InvalidJSON(t *testing.T) {
	h := &Handler{}
	req := httptest.NewRequest(http.MethodPost, "/api/invitations/accept", bytes.NewBufferString(`{`))
	w := httptest.NewRecorder()

	h.AcceptInvitation(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400", w.Code)
	}
}

func TestLogin_InvalidJSON(t *testing.T) {
	h := &Handler{}
	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewBufferString("{"))
	w := httptest.NewRecorder()

	h.Login(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400", w.Code)
	}
}
