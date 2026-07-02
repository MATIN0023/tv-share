package util

import (
	"strings"
	"testing"
)

func TestNormalizeInviteCode(t *testing.T) {
	tests := []struct {
		in   string
		want string
	}{
		{"AbCdEf123456", "abcdef123456"},
		{"  abc123  ", "abc123"},
		{"https://app.example.com/join/AbCdEf?ref=1", "abcdef"},
		{"path/to/CODE123?x=1", "code123"},
		{"plaincode", "plaincode"},
	}
	for _, tt := range tests {
		if got := NormalizeInviteCode(tt.in); got != tt.want {
			t.Errorf("NormalizeInviteCode(%q) = %q, want %q", tt.in, got, tt.want)
		}
	}
}

func TestGenerateInviteCode_Length(t *testing.T) {
	code := GenerateInviteCode()
	if len(code) != 12 {
		t.Errorf("GenerateInviteCode length = %d, want 12 hex chars", len(code))
	}
	if code != strings.ToLower(code) {
		t.Error("invite code should be lowercase hex")
	}
}

func TestGenerateID_Unique(t *testing.T) {
	a := GenerateID()
	b := GenerateID()
	if a == b {
		t.Error("expected unique IDs")
	}
	if len(a) != 32 {
		t.Errorf("GenerateID length = %d, want 32", len(a))
	}
}
