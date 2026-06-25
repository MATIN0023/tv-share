package phone

import (
	"regexp"
	"strings"
)

var iranPhoneRegex = regexp.MustCompile(`^09\d{9}$`)

func Normalize(s string) string {
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, " ", "")
	s = strings.ReplaceAll(s, "-", "")
	if strings.HasPrefix(s, "+98") {
		s = "0" + s[3:]
	}
	if strings.HasPrefix(s, "98") && len(s) == 12 {
		s = "0" + s[2:]
	}
	return s
}

func Valid(s string) bool {
	return iranPhoneRegex.MatchString(Normalize(s))
}
