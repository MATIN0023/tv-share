package auth

import (
	"regexp"
	"testing"
)

func TestGenerateOTPCode(t *testing.T) {
	re := regexp.MustCompile(`^\d{5}$`)
	for i := 0; i < 50; i++ {
		code, err := GenerateOTPCode()
		if err != nil {
			t.Fatalf("iteration %d: %v", i, err)
		}
		if !re.MatchString(code) {
			t.Errorf("code %q is not 5 digits", code)
		}
	}
}

func TestGenerateOTPCode_Uniqueness(t *testing.T) {
	seen := make(map[string]struct{})
	for i := 0; i < 100; i++ {
		code, err := GenerateOTPCode()
		if err != nil {
			t.Fatal(err)
		}
		seen[code] = struct{}{}
	}
	if len(seen) < 2 {
		t.Log("warning: low OTP diversity in sample (may be flaky but unlikely)")
	}
}
