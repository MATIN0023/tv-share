package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"watch-party/internal/util"
)

func TestPaymentWebhook_NoSecretConfigured(t *testing.T) {
	h := &Handler{PaymentWebhookSecret: ""}
	body := `{"gateway_reference":"pay_test","status":"completed"}`
	req := httptest.NewRequest(http.MethodPost, "/api/payment/webhook", bytes.NewBufferString(body))
	w := httptest.NewRecorder()

	h.PaymentWebhook(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("status = %d, want 503", w.Code)
	}
}

func TestPaymentWebhook_InvalidSignature(t *testing.T) {
	h := &Handler{PaymentWebhookSecret: "webhook-secret"}
	body := []byte(`{"gateway_reference":"pay_test","status":"completed"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/payment/webhook", bytes.NewReader(body))
	req.Header.Set("X-Payment-Signature", "deadbeef")
	w := httptest.NewRecorder()

	h.PaymentWebhook(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want 401", w.Code)
	}
}

func TestPaymentWebhook_ValidSignatureMissingRef(t *testing.T) {
	secret := "webhook-secret"
	body := []byte(`{"status":"completed"}`)
	sig := util.SignHMACHex(body, secret)

	h := &Handler{PaymentWebhookSecret: secret}
	req := httptest.NewRequest(http.MethodPost, "/api/payment/webhook", bytes.NewReader(body))
	req.Header.Set("X-Payment-Signature", sig)
	w := httptest.NewRecorder()

	h.PaymentWebhook(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400", w.Code)
	}
}

func TestPaymentWebhook_InvalidJSON(t *testing.T) {
	secret := "webhook-secret"
	body := []byte(`{invalid`)
	sig := util.SignHMACHex(body, secret)

	h := &Handler{PaymentWebhookSecret: secret}
	req := httptest.NewRequest(http.MethodPost, "/api/payment/webhook", bytes.NewReader(body))
	req.Header.Set("X-Payment-Signature", sig)
	w := httptest.NewRecorder()

	h.PaymentWebhook(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400", w.Code)
	}
}

func TestQueryInt(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/?page=3&bad=x", nil)
	if got := QueryInt(req, "page", 1); got != 3 {
		t.Errorf("page = %d, want 3", got)
	}
	if got := QueryInt(req, "missing", 10); got != 10 {
		t.Errorf("default = %d, want 10", got)
	}
	if got := QueryInt(req, "bad", 5); got != 5 {
		t.Errorf("invalid = %d, want default 5", got)
	}
}

func TestWriteJSONError(t *testing.T) {
	w := httptest.NewRecorder()
	WriteJSONError(w, http.StatusForbidden, "nope")

	if w.Code != http.StatusForbidden {
		t.Errorf("status = %d", w.Code)
	}
	if ct := w.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("content-type = %q", ct)
	}
	var body map[string]string
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body["error"] != "nope" {
		t.Errorf("error = %q", body["error"])
	}
}
