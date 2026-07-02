package util

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
)

func GenerateID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func GenerateInviteCode() string {
	b := make([]byte, 6)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// NormalizeInviteCode trims pasted URLs/query strings and lowercases hex codes.
func NormalizeInviteCode(code string) string {
	code = strings.TrimSpace(code)
	if idx := strings.LastIndex(code, "/"); idx >= 0 && len(code) > idx+1 {
		code = code[idx+1:]
	}
	if qi := strings.Index(code, "?"); qi >= 0 {
		code = code[:qi]
	}
	return strings.ToLower(strings.TrimSpace(code))
}
