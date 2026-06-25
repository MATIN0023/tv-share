package util

import (
	"regexp"
	"strings"
)

var nonSlug = regexp.MustCompile(`[^a-z0-9]+`)

func Slugify(input string) string {
	s := strings.TrimSpace(strings.ToLower(input))
	s = nonSlug.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}
