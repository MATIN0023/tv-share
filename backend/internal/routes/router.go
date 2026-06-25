package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"

	"watch-party/internal/auth"
	"watch-party/internal/handlers"
	"watch-party/internal/middleware"
	"watch-party/internal/repository"
	"watch-party/internal/ws"

	_ "watch-party/docs"
)

func New(h *handlers.Handler, authH *auth.Handler, hub *ws.Hub, jwtAuth *auth.JWT, repo *repository.Repository) http.Handler {
	r := mux.NewRouter().StrictSlash(true)

	r.HandleFunc("/ws", func(w http.ResponseWriter, req *http.Request) {
		ws.Serve(hub, w, req)
	}).Methods(http.MethodGet)

	r.PathPrefix("/docs/").Handler(httpSwagger.WrapHandler)
	r.HandleFunc("/docs", func(w http.ResponseWriter, req *http.Request) {
		http.Redirect(w, req, "/docs/index.html", http.StatusMovedPermanently)
	}).Methods(http.MethodGet)

	// Public payment webhook (no auth)
	r.HandleFunc("/api/payment/webhook", h.PaymentWebhook).Methods(http.MethodPost)

	// Public settings (no auth)
	r.HandleFunc("/api/settings/public", h.GetPublicSettings).Methods(http.MethodGet)

	authRouter := r.PathPrefix("/auth").Subrouter()
	authRouter.HandleFunc("/register", h.Register).Methods(http.MethodPost)
	authRouter.HandleFunc("/login", h.Login).Methods(http.MethodPost)
	authRouter.HandleFunc("/otp/request", authH.RequestOTP).Methods(http.MethodPost)
	authRouter.HandleFunc("/otp/verify", authH.VerifyOTP).Methods(http.MethodPost)

	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.RequireAuth(jwtAuth))
	api.Use(middleware.MaintenanceMode(repo))

	// User profile
	api.HandleFunc("/users/me", h.GetCurrentUser).Methods(http.MethodGet)
	api.HandleFunc("/users/me", h.UpdateProfile).Methods(http.MethodPut)
	api.HandleFunc("/users/me/password", h.ChangePassword).Methods(http.MethodPut)
	api.HandleFunc("/users/me/avatar", h.UpdateAvatar).Methods(http.MethodPut)
	api.HandleFunc("/users", h.ListUsers).Methods(http.MethodGet)
	api.HandleFunc("/users/blocked", h.ListBlockedUsers).Methods(http.MethodGet)
	api.HandleFunc("/users/{id}/block", h.BlockUser).Methods(http.MethodPost)

	// Billing / subscription
	api.HandleFunc("/plans", h.ListPlans).Methods(http.MethodGet)
	api.HandleFunc("/subscription", h.GetSubscription).Methods(http.MethodGet)
	api.HandleFunc("/subscription/upgrade", h.UpgradeSubscription).Methods(http.MethodPost)
	api.HandleFunc("/coupons/validate", h.ValidateCoupon).Methods(http.MethodPost)
	api.HandleFunc("/transactions", h.ListUserTransactions).Methods(http.MethodGet)

	// User activity log
	api.HandleFunc("/activity", h.ListMyActivity).Methods(http.MethodGet)

	// User reports
	api.HandleFunc("/reports", h.CreateReport).Methods(http.MethodPost)

	// Notifications
	api.HandleFunc("/notifications", h.ListNotifications).Methods(http.MethodGet)
	api.HandleFunc("/notifications/read-all", h.MarkAllNotificationsRead).Methods(http.MethodPut)
	api.HandleFunc("/notifications/{id}/read", h.MarkNotificationRead).Methods(http.MethodPut)

	// Support tickets
	api.HandleFunc("/tickets", h.ListTickets).Methods(http.MethodGet)
	api.HandleFunc("/tickets", h.CreateTicket).Methods(http.MethodPost)
	api.HandleFunc("/tickets/{id}", h.GetTicket).Methods(http.MethodGet)
	api.HandleFunc("/tickets/{id}/messages", h.AddTicketMessage).Methods(http.MethodPost)

	// Video library
	api.HandleFunc("/videos", h.ListVideos).Methods(http.MethodGet)
	api.HandleFunc("/videos/upload", h.UploadVideo).Methods(http.MethodPost)
	api.HandleFunc("/videos/{id}", h.DeleteVideo).Methods(http.MethodDelete)
	api.HandleFunc("/videos/{id}/status", h.GetVideoStatus).Methods(http.MethodGet)

	// Rooms
	api.HandleFunc("/rooms", h.ListRooms).Methods(http.MethodGet)
	api.HandleFunc("/rooms", h.CreateRoom).Methods(http.MethodPost)
	api.HandleFunc("/rooms/search", h.SearchRooms).Methods(http.MethodGet)
	api.HandleFunc("/rooms/{id}", h.GetRoom).Methods(http.MethodGet)
	api.HandleFunc("/rooms/{id}/video", h.UpdateRoomVideo).Methods(http.MethodPut)
	api.HandleFunc("/rooms/{id}/invitations", h.CreateInvitation).Methods(http.MethodPost)
	api.HandleFunc("/rooms/{id}/messages", h.GetRoomMessages).Methods(http.MethodGet)
	api.HandleFunc("/rooms/{id}/playback/play", h.PlayVideo).Methods(http.MethodPost)
	api.HandleFunc("/rooms/{id}/playback/pause", h.PauseVideo).Methods(http.MethodPost)
	api.HandleFunc("/rooms/{id}/playback/seek", h.SeekVideo).Methods(http.MethodPost)

	api.HandleFunc("/invitations/accept", h.AcceptInvitation).Methods(http.MethodPost)

	api.HandleFunc("/feed", h.GetFeed).Methods(http.MethodGet)
	api.HandleFunc("/watch-history", h.GetWatchHistory).Methods(http.MethodGet)
	api.HandleFunc("/room-history", h.GetRoomHistory).Methods(http.MethodGet)

	api.HandleFunc("/friends", h.ListFriends).Methods(http.MethodGet)
	api.HandleFunc("/friends/requests", h.ListFriendRequests).Methods(http.MethodGet)
	api.HandleFunc("/friends/requests", h.SendFriendRequest).Methods(http.MethodPost)
	api.HandleFunc("/friends/requests/accept", h.AcceptFriendRequest).Methods(http.MethodPut)
	api.HandleFunc("/friends/requests/reject", h.RejectFriendRequest).Methods(http.MethodPut)

	api.HandleFunc("/schedule", h.ListScheduledVideos).Methods(http.MethodGet)
	api.HandleFunc("/schedule", h.CreateScheduledVideo).Methods(http.MethodPost)
	api.HandleFunc("/schedule/{id}/complete", h.CompleteScheduledVideo).Methods(http.MethodPost)
	api.HandleFunc("/schedule/{id}", h.DeleteScheduledVideo).Methods(http.MethodDelete)

	// Admin dashboard
	admin := api.PathPrefix("/admin").Subrouter()
	admin.Use(middleware.RequireAdmin(repo))
	admin.HandleFunc("/stats", h.AdminGetStats).Methods(http.MethodGet)
	admin.HandleFunc("/users", h.AdminListUsers).Methods(http.MethodGet)
	admin.HandleFunc("/users", h.AdminCreateUser).Methods(http.MethodPost)
	admin.HandleFunc("/users/{id}", h.AdminUpdateUser).Methods(http.MethodPut)
	admin.HandleFunc("/users/{id}", h.AdminDeleteUser).Methods(http.MethodDelete)
	admin.HandleFunc("/users/{id}/ban", h.AdminBanUser).Methods(http.MethodPut)
	admin.HandleFunc("/users/{id}/subscription", h.AdminAssignSubscription).Methods(http.MethodPut)
	admin.HandleFunc("/users/{id}/password", h.AdminResetUserPassword).Methods(http.MethodPut)
	admin.HandleFunc("/plans", h.AdminListPlans).Methods(http.MethodGet)
	admin.HandleFunc("/plans", h.AdminCreatePlan).Methods(http.MethodPost)
	admin.HandleFunc("/plans/{id}", h.AdminUpdatePlan).Methods(http.MethodPut)
	admin.HandleFunc("/transactions", h.AdminListTransactions).Methods(http.MethodGet)
	admin.HandleFunc("/reports", h.AdminListReports).Methods(http.MethodGet)
	admin.HandleFunc("/reports/{id}/resolve", h.AdminResolveReport).Methods(http.MethodPut)
	admin.HandleFunc("/rooms", h.AdminListRooms).Methods(http.MethodGet)
	admin.HandleFunc("/rooms/live", h.AdminListLiveRooms).Methods(http.MethodGet)
	admin.HandleFunc("/rooms/{id}/close", h.AdminCloseRoom).Methods(http.MethodPut)
	admin.HandleFunc("/discounts", h.AdminListDiscounts).Methods(http.MethodGet)
	admin.HandleFunc("/discounts", h.AdminCreateDiscount).Methods(http.MethodPost)
	admin.HandleFunc("/discounts/{id}", h.AdminUpdateDiscount).Methods(http.MethodPut)
	admin.HandleFunc("/discounts/{id}", h.AdminDeleteDiscount).Methods(http.MethodDelete)
	admin.HandleFunc("/logs", h.AdminListLogs).Methods(http.MethodGet)
	admin.HandleFunc("/videos/{id}", h.AdminDeleteVideo).Methods(http.MethodDelete)
	admin.HandleFunc("/settings", h.AdminGetSettings).Methods(http.MethodGet)
	admin.HandleFunc("/settings", h.AdminUpdateSettings).Methods(http.MethodPut)
	admin.HandleFunc("/settings/maintenance", h.AdminSetMaintenance).Methods(http.MethodPut)

	api.HandleFunc("/debug/rooms", func(w http.ResponseWriter, req *http.Request) {
		rooms, err := h.Repo.ListRooms(req.Context())
		if err != nil {
			handlers.WriteJSONError(w, http.StatusInternalServerError, "Failed to list rooms")
			return
		}
		handlers.WriteJSON(w, http.StatusOK, rooms)
	}).Methods(http.MethodGet)

	return middleware.CORS(r)
}
