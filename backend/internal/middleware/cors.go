package middleware

import (
	"net/http"
	"os"
	"strings"
)

// CORS allows the Next.js frontend to call the API.
func CORS(next http.Handler) http.Handler {
	allowed := os.Getenv("CORS_ORIGIN")
	if allowed == "" {
		allowed = "http://localhost:3000"
	}
	origins := strings.Split(allowed, ",")

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowedOrigin := ""
		for _, o := range origins {
			o = strings.TrimSpace(o)
			if o == origin || o == "*" {
				allowedOrigin = origin
				if o == "*" {
					allowedOrigin = "*"
				}
				break
			}
		}
		// Dev fallback: allow localhost/127.0.0.1 on any port when CORS_ORIGIN is default
		if allowedOrigin == "" && origin != "" {
			if strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:") {
				allowedOrigin = origin
			}
		}
		if allowedOrigin != "" {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
