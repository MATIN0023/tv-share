package middleware

import (
	"net/http"

	"watch-party/internal/auth"
	"watch-party/internal/handlers"
)

func RequireAuth(jwtAuth *auth.JWT) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := auth.ExtractBearerToken(r)
			if token == "" {
				handlers.WriteJSONError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
			userID, err := jwtAuth.ParseUserID(token)
			if err != nil || userID == "" {
				handlers.WriteJSONError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
			ctx := auth.WithUserID(r.Context(), userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
