package middleware

import (
	"net/http"

	"watch-party/internal/auth"
	"watch-party/internal/handlers"
	"watch-party/internal/models"
	"watch-party/internal/repository"
)

func RequireAuth(jwtAuth *auth.JWT, repo *repository.Repository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := auth.ExtractBearerToken(r)
			if token == "" {
				handlers.WriteJSONError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
			claims, err := jwtAuth.ParseClaims(token)
			if err != nil || claims.UserID == "" {
				handlers.WriteJSONError(w, http.StatusUnauthorized, "Session expired, please login again")
				return
			}

			user, err := repo.GetUserByID(r.Context(), claims.UserID)
			if err != nil {
				handlers.WriteJSONError(w, http.StatusUnauthorized, "Session expired, please login again")
				return
			}
			if !user.IsActive {
				handlers.WriteJSONError(w, http.StatusForbidden, "Account is suspended")
				return
			}
			if claims.TokenVersion != user.TokenVersion {
				handlers.WriteJSONError(w, http.StatusUnauthorized, "Session expired, please login again")
				return
			}

			ctx := auth.WithUserID(r.Context(), user.ID.Hex())
			ctx = auth.WithRole(ctx, user.Role)
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
			if err != nil || !models.IsAdminRole(user.Role) {
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
				uid := auth.UserIDFromContext(r.Context())
				if uid != "" {
					if user, uerr := repo.GetUserByID(r.Context(), uid); uerr == nil && models.IsAdminRole(user.Role) {
						next.ServeHTTP(w, r)
						return
					}
				}
				handlers.WriteJSONError(w, http.StatusServiceUnavailable, "Service under maintenance")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
