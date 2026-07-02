package auth

import (
	"context"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestJWT_GenerateAndParseClaims(t *testing.T) {
	j := NewJWT([]byte("test-secret-key-for-jwt"))

	token, err := j.Generate("user123", "09123456789", "user", 1)
	if err != nil {
		t.Fatalf("Generate: %v", err)
	}
	if token == "" {
		t.Fatal("expected non-empty token")
	}

	claims, err := j.ParseClaims(token)
	if err != nil {
		t.Fatalf("ParseClaims: %v", err)
	}
	if claims.UserID != "user123" {
		t.Errorf("UserID = %q, want user123", claims.UserID)
	}
	if claims.PhoneNumber != "09123456789" {
		t.Errorf("PhoneNumber = %q", claims.PhoneNumber)
	}
	if claims.Role != "user" {
		t.Errorf("Role = %q", claims.Role)
	}
	if claims.TokenVersion != 1 {
		t.Errorf("TokenVersion = %d, want 1", claims.TokenVersion)
	}
}

func TestJWT_ParseUserID(t *testing.T) {
	j := NewJWT([]byte("secret"))
	token, _ := j.Generate("abc", "09121111111", "admin", 0)

	id, err := j.ParseUserID(token)
	if err != nil {
		t.Fatalf("ParseUserID: %v", err)
	}
	if id != "abc" {
		t.Errorf("got %q", id)
	}
}

func TestJWT_WrongSecret(t *testing.T) {
	a := NewJWT([]byte("secret-a"))
	b := NewJWT([]byte("secret-b"))

	token, err := a.Generate("u1", "09120000000", "user", 0)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := b.ParseClaims(token); err == nil {
		t.Error("expected error when parsing with wrong secret")
	}
}

func TestJWT_InvalidToken(t *testing.T) {
	j := NewJWT([]byte("secret"))
	for _, tok := range []string{"", "not.a.jwt", "eyJhbGciOiJIUzI1NiJ9.e30.x"} {
		if _, err := j.ParseClaims(tok); err == nil {
			t.Errorf("expected error for token %q", tok)
		}
	}
}

func TestJWT_ExpiredToken(t *testing.T) {
	j := NewJWT([]byte("secret"))
	claims := Claims{
		UserID:      "u1",
		PhoneNumber: "09120000000",
		Role:        "user",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(j.secret)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := j.ParseClaims(token); err == nil {
		t.Error("expected expired token to fail")
	}
}

func TestJWT_TokenVersionRoundTrip(t *testing.T) {
	j := NewJWT([]byte("secret"))
	token, _ := j.Generate("u1", "09120000000", "user", 42)
	claims, err := j.ParseClaims(token)
	if err != nil {
		t.Fatal(err)
	}
	if claims.TokenVersion != 42 {
		t.Errorf("TokenVersion = %d", claims.TokenVersion)
	}
}

func TestExtractBearerToken(t *testing.T) {
	tests := []struct {
		name   string
		header string
		want   string
	}{
		{"valid", "Bearer abc.def.ghi", "abc.def.ghi"},
		{"missing", "", ""},
		{"wrong scheme", "Basic abc", ""},
		{"missing token part", "Bearer", ""},
		{"extra parts", "Bearer a b", ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := httptest.NewRequest("GET", "/", nil)
			if tt.header != "" {
				r.Header.Set("Authorization", tt.header)
			}
			if got := ExtractBearerToken(r); got != tt.want {
				t.Errorf("ExtractBearerToken() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestContextHelpers(t *testing.T) {
	ctx := context.Background()
	ctx = WithUserID(ctx, "uid-1")
	ctx = WithRole(ctx, "admin")

	if UserIDFromContext(ctx) != "uid-1" {
		t.Errorf("UserIDFromContext = %q", UserIDFromContext(ctx))
	}
	if RoleFromContext(ctx) != "admin" {
		t.Errorf("RoleFromContext = %q", RoleFromContext(ctx))
	}
	if UserIDFromContext(context.Background()) != "" {
		t.Error("expected empty user id on fresh context")
	}
}
