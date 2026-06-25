package middleware

import (
	"net/http"

	"watch-party/internal/auth"
	"watch-party/internal/handlers"
	"watch-party/internal/models"
	"watch-party/internal/repository"
)

func RequireAuth(jwtAuth *auth.JWT) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := auth.ExtractBearerToken(r)
			if token == "" {
				handlers.WriteJSONError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
			claims, err := jwtAuth.ParseClaims(token)
			if err != nil || claims.UserID == "" {
				handlers.WriteJSONError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
			ctx := auth.WithUserID(r.Context(), claims.UserID)
			ctx = auth.WithRole(ctx, claims.Role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireAdmin(repo *repository.Repository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			uid := auth.UserIDFromContext(r.Context())
			if uid == "" {
				handlers.WriteJSONError(w, http.StatusForbidden, "Admin access required")
				return
			}
			user, err := repo.GetUserByID(r.Context(), uid)
			if err != nil || (user.Role != models.RoleAdmin && user.Role != models.RoleSuperAdmin) {
				handlers.WriteJSONError(w, http.StatusForbidden, "Admin access required")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func MaintenanceMode(repo *repository.Repository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			settings, err := repo.GetSettings(r.Context())
			if err == nil && settings.MaintenanceMode {
				role := auth.RoleFromContext(r.Context())
				if role != models.RoleAdmin && role != models.RoleSuperAdmin {
					handlers.WriteJSONError(w, http.StatusServiceUnavailable, "Service under maintenance")
					return
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}
