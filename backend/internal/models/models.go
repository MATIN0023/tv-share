package models

import "time"

type User struct {
	ID           string     `json:"id"`
	Username     string     `json:"username"`
	PasswordHash string     `json:"-"`
	DisplayName  string     `json:"display_name"`
	Email        string     `json:"email"`
	FamilyName   string     `json:"family_name"`
	Birthday     *time.Time `json:"birthday"`
	Gender       string     `json:"gender"`
	Phone        string     `json:"phone"`
	Country      string     `json:"country"`
	City         string     `json:"city"`
	Bio          string     `json:"bio"`
	AvatarURL    string     `json:"avatar_url"`
	CreatedAt    time.Time  `json:"created_at"`
}

type Room struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	VideoPath   string    `json:"video_path"`
	OwnerID     string    `json:"owner_id"`
	Visibility  string    `json:"visibility"`
	Background  string    `json:"background"`
	CreatedAt   time.Time `json:"created_at"`
	IsPlaying   bool      `json:"is_playing"`
	CurrentTime float64   `json:"current_time"`
	IsPaused    bool      `json:"is_paused"`
	Duration    float64   `json:"duration"`
}

type Message struct {
	ID         string    `json:"id"`
	RoomID     string    `json:"room_id"`
	SenderID   string    `json:"sender_id"`
	SenderName string    `json:"sender_name"`
	Content    string    `json:"content"`
	Timestamp  time.Time `json:"timestamp"`
}

type Invitation struct {
	ID        string    `json:"id"`
	RoomID    string    `json:"room_id"`
	Code      string    `json:"code"`
	ExpiresAt time.Time `json:"expires_at"`
	MaxUses   int       `json:"max_uses"`
	UsedCount int       `json:"used_count"`
}

type FriendRequest struct {
	ID         string    `json:"id"`
	FromUserID string    `json:"from_user_id"`
	ToUserID   string    `json:"to_user_id"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}

type WatchHistory struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	RoomID    string    `json:"room_id"`
	RoomName  string    `json:"room_name"`
	VideoPath string    `json:"video_path"`
	WatchedAt time.Time `json:"watched_at"`
	Duration  int       `json:"duration"`
}

type Friend struct {
	ID           string    `json:"id"`
	FriendID     string    `json:"friend_id"`
	FriendName   string    `json:"friend_name"`
	FriendAvatar string    `json:"friend_avatar"`
	AddedAt      time.Time `json:"added_at"`
}

type VideoFeed struct {
	RoomID      string    `json:"room_id"`
	RoomName    string    `json:"room_name"`
	VideoPath   string    `json:"video_path"`
	OwnerID     string    `json:"owner_id"`
	OwnerName   string    `json:"owner_name"`
	OwnerAvatar string    `json:"owner_avatar"`
	CreatedAt   time.Time `json:"created_at"`
}

type ScheduledVideo struct {
	ID           string    `json:"id"`
	RoomID       string    `json:"room_id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	VideoURL     string    `json:"video_url"`
	ScheduledFor time.Time `json:"scheduled_for"`
	CreatedAt    time.Time `json:"created_at"`
	CreatedBy    string    `json:"created_by"`
	IsPlayed     bool      `json:"is_played"`
}
