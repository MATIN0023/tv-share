package main

import (
	"database/sql"
	"log"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

var db *sql.DB

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "./watchparty.db")
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}

	schema := []string{
		// Users
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			display_name TEXT,
			avatar_url TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,

		// Rooms
		`CREATE TABLE IF NOT EXISTS rooms (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			video_path TEXT,
			owner_id TEXT NOT NULL,
			visibility TEXT NOT NULL DEFAULT 'public',
			is_playing INTEGER NOT NULL DEFAULT 0,
			current_time REAL NOT NULL DEFAULT 0,
			is_paused INTEGER NOT NULL DEFAULT 0,
			duration REAL NOT NULL DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
		)`,

		// Add visibility column if missing (migration for existing DBs)
		`ALTER TABLE rooms ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'`,
		`ALTER TABLE rooms ADD COLUMN is_playing INTEGER NOT NULL DEFAULT 0`,
		`ALTER TABLE rooms ADD COLUMN current_time REAL NOT NULL DEFAULT 0`,
		`ALTER TABLE rooms ADD COLUMN is_paused INTEGER NOT NULL DEFAULT 0`,
		`ALTER TABLE rooms ADD COLUMN duration REAL NOT NULL DEFAULT 0`,

		// Messages
		`CREATE TABLE IF NOT EXISTS messages (
			id TEXT PRIMARY KEY,
			room_id TEXT NOT NULL,
			sender_id TEXT NOT NULL,
			sender_name TEXT NOT NULL,
			content TEXT NOT NULL,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
			FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
		)`,

		// Invitations
		`CREATE TABLE IF NOT EXISTS invitations (
			id TEXT PRIMARY KEY,
			room_id TEXT NOT NULL,
			code TEXT UNIQUE NOT NULL,
			expires_at DATETIME NOT NULL,
			max_uses INTEGER DEFAULT 1,
			used_count INTEGER DEFAULT 0,
			FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
		)`,

		// Friendships
		`CREATE TABLE IF NOT EXISTS friendships (
			id TEXT PRIMARY KEY,
			from_user_id TEXT NOT NULL,
			to_user_id TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'pending',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE(from_user_id, to_user_id)
		)`,

		// Watch History
		`CREATE TABLE IF NOT EXISTS watch_history (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			room_id TEXT NOT NULL,
			room_name TEXT NOT NULL,
			video_path TEXT,
			watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			duration INTEGER DEFAULT 0,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
		)`,

		// Scheduled Videos
		`CREATE TABLE IF NOT EXISTS scheduled_videos (
			id TEXT PRIMARY KEY,
			room_id TEXT NOT NULL,
			title TEXT NOT NULL,
			description TEXT,
			video_url TEXT NOT NULL,
			scheduled_for DATETIME NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			created_by TEXT NOT NULL,
			is_played INTEGER NOT NULL DEFAULT 0,
			FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
		)`,

		// Sessions
		`CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,
	}

	for _, stmt := range schema {
		if _, err := db.Exec(stmt); err != nil {
			// Ignore "duplicate column" error for migration
			if !strings.Contains(err.Error(), "duplicate column name") {
				log.Println("Schema warning:", err)
			}
		}
	}
}

// ==================== UERS ====================

func listUsers() ([]User, error) {
	rows, err := db.Query(`
		SELECT id, username, display_name, avatar_url FROM users ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Username, &u.DisplayName, &u.AvatarURL); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	if users == nil {
		users = []User{}
	}
	return users, nil
}

// Get online users (for real app, use WebSocket presence)

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func createUser(id, username, password, displayName string) error {
	hash, err := hashPassword(password)
	if err != nil {
		return err
	}
	_, err = db.Exec(
		"INSERT INTO users (id, username, password_hash, display_name) VALUES (?, ?, ?, ?)",
		id, username, hash, displayName,
	)
	return err
}

func getUserByUsername(username string) (*User, error) {
	row := db.QueryRow(`
		SELECT id, username, password_hash, display_name,
		       COALESCE(avatar_url, '') as avatar_url,
		       created_at
		FROM users WHERE username = ?
	`, username)
	u := &User{}
	err := row.Scan(&u.ID, &u.Username, &u.PasswordHash, &u.DisplayName, &u.AvatarURL, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func getUserByID(id string) (*User, error) {
	row := db.QueryRow(`
		SELECT id, username, password_hash, display_name,
		       COALESCE(avatar_url, '') as avatar_url,
		       created_at
		FROM users WHERE id = ?
	`, id)
	u := &User{}
	err := row.Scan(&u.ID, &u.Username, &u.PasswordHash, &u.DisplayName, &u.AvatarURL, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func updateUserProfile(id, displayName, avatarURL string) error {
	_, err := db.Exec(
		"UPDATE users SET display_name = ?, avatar_url = ? WHERE id = ?",
		displayName, avatarURL, id,
	)
	return err
}

// ==================== ROOM OPERATIONS ====================

func createRoom(id, name, ownerID, visibility string) error {
	_, err := db.Exec(
		"INSERT INTO rooms (id, name, owner_id, visibility) VALUES (?, ?, ?, ?)",
		id, name, ownerID, visibility,
	)
	return err
}

func getRoom(id string) (*Room, error) {
	row := db.QueryRow(`
		SELECT id, name, COALESCE(video_path, ''), owner_id, visibility, created_at,
		       COALESCE(is_playing, 0), COALESCE(current_time, 0),
		       COALESCE(is_paused, 0), COALESCE(duration, 0)
		FROM rooms WHERE id = ?
	`, id)
	r := &Room{}
	err := row.Scan(&r.ID, &r.Name, &r.VideoPath, &r.OwnerID, &r.Visibility, &r.CreatedAt,
		&r.IsPlaying, &r.CurrentTime, &r.IsPaused, &r.Duration)
	if err != nil {
		return nil, err
	}
	r.Clients = make(map[*Client]bool)
	return r, nil
}

func listRooms() ([]Room, error) {
	rows, err := db.Query(`
		SELECT id, name, COALESCE(video_path, ''), owner_id, visibility, created_at
		FROM rooms ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []Room
	for rows.Next() {
		var r Room
		if err := rows.Scan(&r.ID, &r.Name, &r.VideoPath, &r.OwnerID, &r.Visibility, &r.CreatedAt); err != nil {
			return nil, err
		}
		r.Clients = make(map[*Client]bool)
		rooms = append(rooms, r)
	}
	if rooms == nil {
		rooms = []Room{}
	}
	return rooms, nil
}

func listPublicVideoFeeds(limit int) ([]VideoFeed, error) {
	rows, err := db.Query(`
		SELECT r.id, r.name, COALESCE(r.video_path, ''), r.owner_id,
		       u.display_name, COALESCE(u.avatar_url, ''), r.created_at
		FROM rooms r
		JOIN users u ON r.owner_id = u.id
		WHERE r.video_path != '' AND r.video_path IS NOT NULL
		  AND r.visibility = 'public'
		ORDER BY r.created_at DESC
		LIMIT ?
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var feeds []VideoFeed
	for rows.Next() {
		var f VideoFeed
		if err := rows.Scan(&f.RoomID, &f.RoomName, &f.VideoPath, &f.OwnerID,
			&f.OwnerName, &f.OwnerAvatar, &f.CreatedAt); err != nil {
			return nil, err
		}
		feeds = append(feeds, f)
	}
	if feeds == nil {
		feeds = []VideoFeed{}
	}
	return feeds, nil
}

func updateRoomPlayback(roomID string) error {
	room, err := getRoom(roomID)
	if err != nil {
		return err
	}
	_, err = db.Exec(`
		UPDATE rooms SET 
			is_playing = ?,
			current_time = ?,
			is_paused = ?,
			duration = ?
		WHERE id = ?
	`, room.IsPlaying, room.CurrentTime, room.IsPaused, room.Duration, roomID)
	return err
}

func updateRoomVideo(roomID, videoPath string) error {
	_, err := db.Exec("UPDATE rooms SET video_path = ? WHERE id = ?", videoPath, roomID)
	return err
}

func deleteRoom(id string) error {
	_, err := db.Exec("DELETE FROM rooms WHERE id = ?", id)
	return err
}

// ==================== MESSAGE OPERATIONS ====================

func saveMessage(roomID, senderID, senderName, content string) (string, error) {
	id := generateID()
	_, err := db.Exec(
		"INSERT INTO messages (id, room_id, sender_id, sender_name, content) VALUES (?, ?, ?, ?, ?)",
		id, roomID, senderID, senderName, content,
	)
	return id, err
}

func getMessages(roomID string, limit int) ([]Message, error) {
	rows, err := db.Query(`
		SELECT id, room_id, sender_id, sender_name, content, timestamp
		FROM messages
		WHERE room_id = ?
		ORDER BY timestamp ASC
		LIMIT ?
	`, roomID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var msgs []Message
	for rows.Next() {
		var m Message
		if err := rows.Scan(&m.ID, &m.RoomID, &m.SenderID, &m.SenderName, &m.Content, &m.Timestamp); err != nil {
			return nil, err
		}
		msgs = append(msgs, m)
	}
	if msgs == nil {
		msgs = []Message{}
	}
	return msgs, nil
}

// ==================== INVITATION OPERATIONS ====================

func createInvitation(roomID, code string, expiresAt time.Time, maxUses int) error {
	id := generateID()
	_, err := db.Exec(
		"INSERT INTO invitations (id, room_id, code, expires_at, max_uses) VALUES (?, ?, ?, ?, ?)",
		id, roomID, code, expiresAt, maxUses,
	)
	return err
}

func getInvitationByCode(code string) (*Invitation, error) {
	row := db.QueryRow(`
		SELECT id, room_id, code, expires_at, max_uses, used_count
		FROM invitations WHERE code = ?
	`, code)
	i := &Invitation{}
	err := row.Scan(&i.ID, &i.RoomID, &i.Code, &i.ExpiresAt, &i.MaxUses, &i.UsedCount)
	if err != nil {
		return nil, err
	}
	return i, nil
}

func validateInvitation(code string) (*Invitation, error) {
	i, err := getInvitationByCode(code)
	if err != nil {
		return nil, err
	}
	if time.Now().After(i.ExpiresAt) {
		return nil, sql.ErrNoRows
	}
	if i.UsedCount >= i.MaxUses {
		return nil, sql.ErrNoRows
	}
	return i, nil
}

func useInvitation(code string) error {
	_, err := db.Exec("UPDATE invitations SET used_count = used_count + 1 WHERE code = ?", code)
	return err
}

// ==================== FRIEND OPERATIONS ====================

func sendFriendRequest(fromUserID, toUserID string) error {
	// Check if already exists
	var count int
	db.QueryRow(
		"SELECT COUNT(*) FROM friendships WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)",
		fromUserID, toUserID, toUserID, fromUserID,
	).Scan(&count)
	if count > 0 {
		return sql.ErrNoRows
	}

	id := generateID()
	_, err := db.Exec(
		"INSERT INTO friendships (id, from_user_id, to_user_id, status) VALUES (?, ?, ?, 'pending')",
		id, fromUserID, toUserID,
	)
	return err
}

func acceptFriendRequest(fromUserID, toUserID string) error {
	_, err := db.Exec(
		"UPDATE friendships SET status = 'accepted' WHERE from_user_id = ? AND to_user_id = ? AND status = 'pending'",
		fromUserID, toUserID,
	)
	return err
}

func rejectFriendRequest(fromUserID, toUserID string) error {
	_, err := db.Exec(
		"DELETE FROM friendships WHERE from_user_id = ? AND to_user_id = ? AND status = 'pending'",
		fromUserID, toUserID,
	)
	return err
}

func getFriends(userID string) ([]Friend, error) {
	rows, err := db.Query(`
		SELECT f.id, u.id, u.display_name, u.avatar_url, f.created_at
		FROM friendships f
		JOIN users u ON (
			CASE WHEN f.from_user_id = ? THEN f.to_user_id = u.id
			     ELSE f.from_user_id = u.id END
		)
		WHERE (f.from_user_id = ? OR f.to_user_id = ?) AND f.status = 'accepted'
		ORDER BY f.created_at DESC
	`, userID, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var friends []Friend
	for rows.Next() {
		var fr Friend
		if err := rows.Scan(&fr.ID, &fr.FriendID, &fr.FriendName, &fr.FriendAvatar, &fr.AddedAt); err != nil {
			return nil, err
		}
		friends = append(friends, fr)
	}
	if friends == nil {
		friends = []Friend{}
	}
	return friends, nil
}

func getPendingRequests(userID string) ([]FriendRequest, error) {
	rows, err := db.Query(`
		SELECT id, from_user_id, to_user_id, status, created_at
		FROM friendships
		WHERE to_user_id = ? AND status = 'pending'
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reqs []FriendRequest
	for rows.Next() {
		var r FriendRequest
		if err := rows.Scan(&r.ID, &r.FromUserID, &r.ToUserID, &r.Status, &r.CreatedAt); err != nil {
			return nil, err
		}
		reqs = append(reqs, r)
	}
	if reqs == nil {
		reqs = []FriendRequest{}
	}
	return reqs, nil
}

// ==================== WATCH HISTORY ====================

func recordWatchHistory(userID, roomID, roomName, videoPath string) error {
	id := generateID()
	_, err := db.Exec(
		"INSERT INTO watch_history (id, user_id, room_id, room_name, video_path) VALUES (?, ?, ?, ?, ?)",
		id, userID, roomID, roomName, videoPath,
	)
	return err
}

func getWatchHistory(userID string, limit int) ([]WatchHistory, error) {
	rows, err := db.Query(`
		SELECT id, user_id, room_id, room_name, video_path, watched_at, duration
		FROM watch_history
		WHERE user_id = ?
		ORDER BY watched_at DESC
		LIMIT ?
	`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []WatchHistory
	for rows.Next() {
		var h WatchHistory
		if err := rows.Scan(&h.ID, &h.UserID, &h.RoomID, &h.RoomName, &h.VideoPath, &h.WatchedAt, &h.Duration); err != nil {
			return nil, err
		}
		history = append(history, h)
	}
	if history == nil {
		history = []WatchHistory{}
	}
	return history, nil
}

func getRoomHistory(userID string, limit int) ([]Room, error) {
	rows, err := db.Query(`
		SELECT DISTINCT r.id, r.name, COALESCE(r.video_path, ''), r.owner_id, r.visibility, r.created_at
		FROM rooms r
		JOIN watch_history wh ON r.id = wh.room_id
		WHERE wh.user_id = ?
		ORDER BY wh.watched_at DESC
		LIMIT ?
	`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []Room
	for rows.Next() {
		var r Room
		if err := rows.Scan(&r.ID, &r.Name, &r.VideoPath, &r.OwnerID, &r.Visibility, &r.CreatedAt); err != nil {
			return nil, err
		}
		r.Clients = make(map[*Client]bool)
		rooms = append(rooms, r)
	}
	if rooms == nil {
		rooms = []Room{}
	}
	return rooms, nil
}

// VideoFeed for home page
type VideoFeed struct {
	RoomID       string    `json:"room_id"`
	RoomName     string    `json:"room_name"`
	VideoPath    string    `json:"video_path"`
	OwnerID      string    `json:"owner_id"`
	OwnerName    string    `json:"owner_name"`
	OwnerAvatar  string    `json:"owner_avatar"`
	CreatedAt    time.Time `json:"created_at"`
}

type ScheduledVideo struct {
	ID          string    `json:"id"`
	RoomID       string    `json:"room_id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	VideoURL     string    `json:"video_url"`
	ScheduledFor time.Time `json:"scheduled_for"`
	CreatedAt    time.Time `json:"created_at"`
	CreatedBy    string    `json:"created_by"`
	IsPlayed     bool      `json:"is_played"`
}

// ==================== SCHEDULED VIDEOS ====================

func createScheduledVideo(id, userID, title, description, videoURL string, scheduledFor time.Time) error {
	_, err := db.Exec(`
		INSERT INTO scheduled_videos (id, user_id, title, description, video_url, scheduled_for)
		VALUES (?, ?, ?, ?, ?, ?)
	`, id, userID, title, description, videoURL, scheduledFor)
	return err
}

func getScheduledVideos(userID, status string) ([]ScheduledVideo, error) {
	var rows *sql.Rows
	var err error
	if status == "" || status == "all" {
		rows, err = db.Query(`
			SELECT id, user_id, title, description, video_url, scheduled_for, created_at, is_played
			FROM scheduled_videos
			WHERE user_id = ?
			ORDER BY scheduled_for ASC
		`, userID)
	} else {
		rows, err = db.Query(`
			SELECT id, user_id, title, description, video_url, scheduled_for, created_at, is_played
			FROM scheduled_videos
			WHERE user_id = ? AND is_played = ?
			ORDER BY scheduled_for ASC
		`, userID, status == "played")
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var videos []ScheduledVideo
	for rows.Next() {
		var v ScheduledVideo
		if err := rows.Scan(&v.ID, &v.CreatedBy, &v.Title, &v.Description, &v.VideoURL, &v.ScheduledFor, &v.CreatedAt, &v.IsPlayed); err != nil {
			return nil, err
		}
		videos = append(videos, v)
	}
	if videos == nil {
		videos = []ScheduledVideo{}
	}
	return videos, nil
}

func completeScheduledVideo(id string) error {
	_, err := db.Exec("UPDATE scheduled_videos SET is_played = 1 WHERE id = ?", id)
	return err
}

func endScheduledVideo(id string) error {
	_, err := db.Exec("DELETE FROM scheduled_videos WHERE id = ?", id)
	return err
}
