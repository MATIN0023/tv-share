package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/golang-jwt/jwt/v5"
)

var globalHub *Hub

var jwtSecret = []byte("watch-party-secret-key-2026")

type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type contextKey string

const userIDKey contextKey = "userID"

func withUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

// extractToken retrieves the JWT token from the Authorization header.
func extractToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}
	return parts[1]
}

// generateJWT creates a signed JWT token for a user.
func generateJWT(userID, username string) string {
	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(jwtSecret)
	if err != nil {
		log.Printf("Failed to sign token: %v", err)
		return ""
	}
	return signed
}

// extractUserIDFromRequest extracts the user ID from the request's Authorization token.
func extractUserIDFromRequest(r *http.Request) string {
	tokenStr := extractToken(r)
	if tokenStr == "" {
		return ""
	}
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return ""
	}
	return claims.UserID
}

// getUserIDFromRequest is an alias for extractUserIDFromRequest.
func getUserIDFromRequest(r *http.Request) string {
	return extractUserIDFromRequest(r)
}

// getUserIDFromContext retrieves the user ID from the request context.
func getUserIDFromContext(ctx context.Context) string {
	userID, ok := ctx.Value(userIDKey).(string)
	if !ok {
		return ""
	}
	return userID
}

func main() {
	initDB()
	defer db.Close()

	// Create default test user if not exists
	createDefaultUser()

	globalHub = newHub()
	go globalHub.run()

	r := mux.NewRouter()

	// Auth routes
	auth := r.PathPrefix("/auth").Subrouter()
	auth.HandleFunc("/register", registerHandler)
	auth.HandleFunc("/login", loginHandler)

	// Login route for SPA routing
	r.HandleFunc("/login", loginHandler).Methods("POST")

	// Protected API routes
	api := r.PathPrefix("/api").Subrouter()
	api.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := extractUserIDFromRequest(r)
			if userID == "" {
				writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
			ctx := withUserID(r.Context(), userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	})

	// Users
	api.HandleFunc("/me", getCurrentUserHandler)
	api.HandleFunc("/profile", updateProfileHandler)
	api.HandleFunc("/users", getUsersHandler)

	// Rooms
	api.HandleFunc("/rooms", createRoomHandler)
	api.HandleFunc("/rooms/{id}", getRoomHandler)
	api.HandleFunc("/rooms/{id}/video", uploadVideoHandler)
	api.HandleFunc("/rooms/{id}/invite", createInviteHandler)
	api.HandleFunc("/invite/accept", acceptInviteHandler)
	api.HandleFunc("/rooms/{id}/messages", getMessagesHandler)
	api.HandleFunc("/rooms/{id}/history/watch", getWatchHistoryHandler)
	api.HandleFunc("/rooms/{id}/history/rooms", getRoomHistoryHandler)
	api.HandleFunc("/rooms/{id}/play", playVideoHandler)
	api.HandleFunc("/rooms/{id}/pause", pauseVideoHandler)
	api.HandleFunc("/rooms/{id}/seek", seekVideoHandler)

	// Feed
	api.HandleFunc("/feed", getFeedHandler)

	// Friends
	api.HandleFunc("/friends", getFriendsHandler)
	api.HandleFunc("/friends/requests", getPendingRequestsHandler)
	api.HandleFunc("/friends/request", handleSendFriendRequest)
	api.HandleFunc("/friends/accept", handleAcceptFriendRequest)
	api.HandleFunc("/friends/reject", handleRejectFriendRequest)

	// Scheduled videos
	api.HandleFunc("/schedule", scheduleVideoHandler)
	api.HandleFunc("/schedule/{id}/play", handlePlayScheduledVideo)
	api.HandleFunc("/schedule/{id}/pause", handlePauseScheduledVideo)
	api.HandleFunc("/schedule/{id}/seek", handleSeekScheduledVideo)
	api.HandleFunc("/schedule/{id}/complete", handleCompleteScheduledVideo)
	api.HandleFunc("/schedule/{id}/end", handleEndScheduledVideo)
	api.HandleFunc("/schedule", getScheduleHandler)

	// Rooms (debug)
	api.HandleFunc("/debug/rooms", func(w http.ResponseWriter, r *http.Request) {
		rooms, _ := listRooms()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(rooms)
	})
	r.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(globalHub, w, r)
	})

	// Serve video files
	r.PathPrefix("/videos/").Handler(http.StripPrefix("/videos/", http.FileServer(http.Dir("./videos/"))))

	// SPA fallback - all other routes serve index.html
	r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./static"))))
	log.Println("Server started at :8090")
	log.Fatal(http.ListenAndServe(":8090", r))
}

// ==================== UTILS ====================

func writeJSONError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// saveFile copies the provided reader to a file at the given path.
func saveFile(file io.Reader, path string) error {
	if err := os.MkdirAll("./videos", 0755); err != nil {
		return err
	}
	dst, err := os.Create(path)
	if err != nil {
		return err
	}
	defer dst.Close()
	_, err = io.Copy(dst, file)
	return err
}

// ==================== AUTH HANDLERS ====================

func registerHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
			Username    string `json:"username"`
		Password    string `json:"password"`
		DisplayName string `json:"display_name"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	if len(req.Username) < 3 {
		writeJSONError(w, http.StatusBadRequest, "Username must be at least 3 characters")
		return
	}
	if len(req.Password) < 6 {
		writeJSONError(w, http.StatusBadRequest, "Password must be at least 6 characters")
		return
	}

	if _, err := getUserByUsername(req.Username); err == nil {
		writeJSONError(w, http.StatusConflict, "Username already taken")
		return
	}

	id := generateID()
	if err := createUser(id, req.Username, req.Password, req.DisplayName); err != nil {
		log.Printf("Failed to create user: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	token := generateJWT(id, req.Username)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"token":    token,
		"user":     req.Username,
		"user_id":  id,
	})
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	user, err := getUserByUsername(req.Username)
	if err != nil {
		writeJSONError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	if !checkPassword(req.Password, user.PasswordHash) {
		writeJSONError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	token := generateJWT(user.ID, user.Username)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
			"token":        token,
		"user":         user.Username,
		"user_id":      user.ID,
		"display_name":  user.DisplayName,
		"avatar":       user.AvatarURL,
	})
}

func createDefaultUser() {
	_, err := getUserByUsername("admin")
	if err == nil {
		return
	}
	id := generateID()
	if err := createUser(id, "admin", "admin123", "Admin User"); err != nil {
		log.Printf("Failed to create default user: %v", err)
	} else {
		log.Println("Default user created: admin / admin123")
	}
}

// ==================== USER HANDLERS ====================

func getCurrentUserHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := getUserByID(userID)
	if err != nil {
		writeJSONError(w, http.StatusNotFound, "User not found")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func updateProfileHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	_, err := getUserByID(userID)
	if err != nil {
		writeJSONError(w, http.StatusNotFound, "User not found")
		return
	}

	var req struct {
		DisplayName string `json:"display_name"`
		AvatarURL   string `json:"avatar_url"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	if err := updateUserProfile(userID, req.DisplayName, req.AvatarURL); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"display_name": req.DisplayName,
			"avatar_url":   req.AvatarURL,
		})
		return
	}
	w.WriteHeader(http.StatusOK)
}

func getUsersHandler(w http.ResponseWriter, r *http.Request) {
	users, err := listUsers()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to get users")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"users": users,
	})
}

// ==================== ROOM HANDLERS ====================

func createRoomHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Name string `json:"name"`
		Visibility string `json:"visibility"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	if req.Visibility == "" {
		req.Visibility = "public"
	}

	id := generateID()
	if err := createRoom(id, req.Name, userID, req.Visibility); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to create room")
		return
	}

	room, err := getRoom(id)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to retrieve room")
		return
	}
	room.Clients = make(map[*Client]bool)
	globalHub.addRoom(room)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(room)
}

func listRoomsHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	rooms, err := listRooms()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to list rooms")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rooms)
}

func getRoomHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["id"]
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	room, err := getRoom(roomID)
	if err != nil {
		writeJSONError(w, http.StatusNotFound, "Room not found")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(room)
}

func uploadVideoHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["id"]
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	room, err := getRoom(roomID)
	if err != nil {
		writeJSONError(w, http.StatusNotFound, "Room not found")
		return
	}

	if room.OwnerID != userID {
		writeJSONError(w, http.StatusForbidden, "Only room owner can upload")
		return
	}

	r.ParseMultipartForm(100 << 20)
	file, header, err := r.FormFile("video")
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "No video file")
		return
	}
	defer file.Close()

	// Validate video type
	contentType := header.Header.Get("Content-Type")
	if contentType != "video/mp4" && contentType != "video/webm" && contentType != "video/ogg" {
		writeJSONError(w, http.StatusUnsupportedMediaType, "Only MP4, WebM, and OGG videos are allowed")
		return
	}

	filename := roomID + "_" + time.Now().Format("20060102_150405") + ".mp4"
	path := "./videos/" + filename
	if err := saveFile(file, path); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to save video")
		return
	}

	videoURL := "/videos/" + filename
	if err := updateRoomVideo(roomID, videoURL); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to update room")
		return
	}

	// Broadcast video change to all clients in room
	if _, ok := globalHub.rooms[roomID]; ok {
		globalHub.broadcastToRoom(roomID, &WSMessage{
			Type: "video_change",
			Video: videoURL,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"url": videoURL,
	})
}

func createInviteHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["id"]

	code := generateInviteCode()
	expires := time.Now().Add(24 * time.Hour)
	if err := createInvitation(roomID, code, expires, 1); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to create invitation")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"code":    code,
			"expires":  expires.Format(time.RFC3339),
		"room_id":  roomID,
	})
}

func acceptInviteHandler(w http.ResponseWriter, r *http.Request) {
	var req struct { Code string `json:"code"` }
	json.NewDecoder(r.Body).Decode(&req)

	inv, err := validateInvitation(req.Code)
	if err != nil {
		writeJSONError(w, http.StatusNotFound, "Invalid or expired invitation")
		return
	}

	if err := useInvitation(req.Code); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to accept invitation")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"room_id": inv.RoomID,
	})
}

// ==================== MESSAGES ====================

func getMessagesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["id"]
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	limit := 100
	messages, err := getMessages(roomID, limit)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to load messages")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// ==================== INVITATION ====================
// Invitation helper functions are defined in database.go


// ==================== FRIENDS ====================

func handleSendFriendRequest(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		ToUserID string `json:"to_user_id"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	if req.ToUserID == userID {
		writeJSONError(w, http.StatusBadRequest, "Cannot friend yourself")
		return
	}

	if err := sendFriendRequest(userID, req.ToUserID); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to send request")
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"status":"sent"}`))
}

func getFriendsHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	friends, err := getFriends(userID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to get friends")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"friends": friends,
	})
}

func getPendingRequestsHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	pending, err := getPendingRequests(userID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to get pending requests")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"pending": pending,
	})
}

func handleAcceptFriendRequest(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		FromUserID string `json:"from_user_id"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	if err := acceptFriendRequest(req.FromUserID, userID); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to accept")
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"status":"accepted"}`))
}

func handleRejectFriendRequest(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		FromUserID string `json:"from_user_id"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	if err := rejectFriendRequest(req.FromUserID, userID); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to reject")
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"status":"rejected"}`))
}

// ==================== WATCH HISTORY ====================

func getFeedHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	feeds, err := listPublicVideoFeeds(50)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to load feed")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(feeds)
}

func getWatchHistoryHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	history, err := getWatchHistory(userID, 50)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to load watch history")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

func getRoomHistoryHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r.Context())

	rooms, err := getRoomHistory(userID, 50)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to load room history")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rooms)
}

// ==================== SCHEDULED VIDEOS ====================

func scheduleVideoHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r.Context())
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		VideoURL    string `json:"video_url"`
		ScheduledAt string `json:"scheduled_at"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	scheduledFor, err := time.Parse(time.RFC3339, req.ScheduledAt)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "Invalid date/time format")
		return
	}

	id := generateID()
	if err := createScheduledVideo(id, userID, req.Title, req.Description, req.VideoURL, scheduledFor); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to schedule video")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"id": id,
		"cheduled_at": req.ScheduledAt,
	})
}

func getScheduleHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r.Context())
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	scheduled, err := getScheduledVideos(userID, "")
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to get scheduled videos")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scheduled)
}

// ==================== SCHEDULED VIDEOS ====================

func handlePlayScheduledVideo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	// Mark as played and redirect to room
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "played", "id": id})
}

func handlePauseScheduledVideo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	_ = vars["id"]
	w.WriteHeader(http.StatusOK)
}

func handleSeekScheduledVideo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	_ = vars["id"]
	w.WriteHeader(http.StatusOK)
}

func handleCompleteScheduledVideo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if err := completeScheduledVideo(id); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to complete")
		return
	}
	w.WriteHeader(http.StatusOK)
}

func handleEndScheduledVideo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if err := endScheduledVideo(id); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to end")
		return
	}
	w.WriteHeader(http.StatusOK)
}

// ==================== ROOM MODAL ====================

func playVideoHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["id"]
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	room, err := getRoom(roomID)
	if err != nil {
		writeJSONError(w, http.StatusNotFound, "Room not found")
		return
	}
	if room.OwnerID != userID {
		writeJSONError(w, http.StatusForbidden, "Only room owner can control playback")
		return
	}

	room.IsPlaying = true
	room.IsPaused = false
	if err := updateRoomPlayback(room.ID); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to update playback state")
		return
	}

	globalHub.broadcastRoomState(room.ID)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(room)
}

func pauseVideoHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["id"]
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	room, err := getRoom(roomID)
	if err != nil {
		writeJSONError(w, http.StatusNotFound, "Room not found")
		return
	}

	if room.OwnerID != userID {
		writeJSONError(w, http.StatusForbidden, "Only room owner can control playback")
		return
	}

	room.IsPlaying = false
	room.IsPaused = true
	if err := updateRoomPlayback(room.ID); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to update playback state")
		return
	}

	globalHub.broadcastRoomState(room.ID)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(room)
}

func seekVideoHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["id"]
	userID := getUserIDFromRequest(r)
	if userID == "" {
		writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		CurrentTime float64 `json:"current_time"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	room, err := getRoom(roomID)
	if err != nil {
		writeJSONError(w, http.StatusNotFound, "Room not found")
		return
	}

	room.CurrentTime = req.CurrentTime
	if err := updateRoomPlayback(room.ID); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to update playback state")
		return
	}

	globalHub.broadcastRoomState(room.ID)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(room)
}