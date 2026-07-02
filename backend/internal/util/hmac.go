package util

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
)

// VerifyHMACHex compares a hex-encoded HMAC-SHA256 signature against the payload.
func VerifyHMACHex(payload []byte, secret, signatureHex string) bool {
	if secret == "" || signatureHex == "" {
		return false
	}
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write(payload)
	expected := mac.Sum(nil)

	got, err := hex.DecodeString(signatureHex)
	if err != nil {
		return false
	}
	return hmac.Equal(expected, got)
}

// SignHMACHex returns the hex-encoded HMAC-SHA256 of payload.
func SignHMACHex(payload []byte, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write(payload)
	return hex.EncodeToString(mac.Sum(nil))
}
