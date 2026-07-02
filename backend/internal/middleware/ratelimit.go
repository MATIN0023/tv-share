package middleware

import (
	"net"
	"net/http"
	"strings"

	"watch-party/internal/handlers"
	"watch-party/internal/ratelimit"
)

func ClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return strings.TrimSpace(strings.Split(xff, ",")[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func RateLimit(limiter *ratelimit.Limiter, keyFunc func(*http.Request) string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := keyFunc(r)
			if !limiter.Allow(key) {
				handlers.WriteJSONError(w, http.StatusTooManyRequests, "Too many requests, please try again later")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func RateLimitByIP(limiter *ratelimit.Limiter) func(http.Handler) http.Handler {
	return RateLimit(limiter, ClientIP)
}
