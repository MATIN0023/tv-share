package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// GoogleTokenInfo is returned by Google's tokeninfo endpoint.
type GoogleTokenInfo struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	Aud           string `json:"aud"`
	Exp           string `json:"exp"`
	Iss           string `json:"iss"`
}

// VerifyGoogleIDToken validates a Google ID token via tokeninfo (set GOOGLE_CLIENT_ID for aud check).
func VerifyGoogleIDToken(idToken, expectedClientID string) (*GoogleTokenInfo, error) {
	if idToken == "" {
		return nil, fmt.Errorf("empty id_token")
	}
	endpoint := "https://oauth2.googleapis.com/tokeninfo?id_token=" + url.QueryEscape(idToken)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(endpoint)
	if err != nil {
		return nil, fmt.Errorf("google tokeninfo request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid google token (status %d)", resp.StatusCode)
	}

	var info GoogleTokenInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, fmt.Errorf("decode tokeninfo: %w", err)
	}
	if info.Sub == "" {
		return nil, fmt.Errorf("token missing sub")
	}
	if expectedClientID != "" && info.Aud != expectedClientID {
		return nil, fmt.Errorf("token audience mismatch")
	}
	if info.Iss != "accounts.google.com" && info.Iss != "https://accounts.google.com" {
		return nil, fmt.Errorf("invalid token issuer")
	}
	return &info, nil
}
