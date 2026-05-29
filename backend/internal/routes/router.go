package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"

	"watch-party/internal/auth"
	"watch-party/internal/handlers"
	"watch-party/internal/middleware"
	"watch-party/internal/ws"

	_ "watch-party/docs"
)

func New(h *handlers.Handler, hub *ws.Hub, jwtAuth *auth.JWT) http.Handler {
	r := mux.NewRouter().StrictSlash(true)

	r.HandleFunc("/ws", func(w http.ResponseWriter, req *http.Request) {
		ws.Serve(hub, w, req)
	}).Methods(http.MethodGet)

	r.PathPrefix("/docs/").Handler(httpSwagger.WrapHandler)
	r.HandleFunc("/docs", func(w http.ResponseWriter, req *http.Request) {
		http.Redirect(w, req, "/docs/index.html", http.StatusMovedPermanently)
	}).Methods(http.MethodGet)

	authRouter := r.PathPrefix("/auth").Subrouter()
	authRouter.HandleFunc("/register", h.Register).Methods(http.MethodPost)
	authRouter.HandleFunc("/login", h.Login).Methods(http.MethodPost)

	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.RequireAuth(jwtAuth))

	api.HandleFunc("/users/me", h.GetCurrentUser).Methods(http.MethodGet)
	api.HandleFunc("/users/me", h.UpdateProfile).Methods(http.MethodPut)
	api.HandleFunc("/users", h.ListUsers).Methods(http.MethodGet)

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

	api.HandleFunc("/debug/rooms", func(w http.ResponseWriter, req *http.Request) {
		rooms, err := h.Repo.ListRooms()
		if err != nil {
			handlers.WriteJSONError(w, http.StatusInternalServerError, "Failed to list rooms")
			return
		}
		handlers.WriteJSON(w, http.StatusOK, rooms)
	}).Methods(http.MethodGet)

	return r
}
