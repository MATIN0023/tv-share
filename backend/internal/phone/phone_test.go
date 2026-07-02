package phone

import "testing"

func TestNormalize(t *testing.T) {
	tests := []struct {
		in   string
		want string
	}{
		{"09123456789", "09123456789"},
		{" 0912 345 6789 ", "09123456789"},
		{"0912-345-6789", "09123456789"},
		{"+989123456789", "09123456789"},
		{"989123456789", "09123456789"},
	}
	for _, tt := range tests {
		if got := Normalize(tt.in); got != tt.want {
			t.Errorf("Normalize(%q) = %q, want %q", tt.in, got, tt.want)
		}
	}
}

func TestValid(t *testing.T) {
	valid := []string{
		"09123456789",
		"+989123456789",
		"989123456789",
	}
	for _, n := range valid {
		if !Valid(n) {
			t.Errorf("Valid(%q) = false, want true", n)
		}
	}

	invalid := []string{
		"",
		"9123456789",
		"08123456789",
		"0912345678",
		"091234567890",
		"abc",
		"+1234567890",
	}
	for _, n := range invalid {
		if Valid(n) {
			t.Errorf("Valid(%q) = true, want false", n)
		}
	}
}
