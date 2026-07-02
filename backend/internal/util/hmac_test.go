package util

import "testing"

func TestVerifyHMACHex(t *testing.T) {
	secret := "test-webhook-secret"
	body := []byte(`{"gateway_reference":"pay_abc","status":"completed"}`)
	sig := SignHMACHex(body, secret)

	if !VerifyHMACHex(body, secret, sig) {
		t.Fatal("expected valid signature")
	}
	if VerifyHMACHex(body, secret, "deadbeef") {
		t.Fatal("expected invalid signature to fail")
	}
	if VerifyHMACHex(body, "wrong-secret", sig) {
		t.Fatal("expected wrong secret to fail")
	}
}
