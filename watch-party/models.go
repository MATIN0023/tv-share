package main

import (
	"time"
)

type User struct {
	ID           string    `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	DisplayName  string    `json:"display_name"`
	AvatarURL    string    `json:"avatar_url"`
	CreatedAt    time.Time `json:"created_at"`
}

type Room struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	VideoPath   string    `json:"video_path"`
	OwnerID     string    `json:"owner_id"`
	Visibility  string    `json:"visibility"`
	CreatedAt   time.Time `json:"created_at"`
	Clients     map[*Client]bool `json:"-"`
	IsPlaying   bool      `json:"is_playing"`
	CurrentTime float64   `json:"current_time"`
	IsPaused    bool      `json:"is_paused"`
	Duration    float64   `json:"duration"`
}

type Message struct {
	ID        string    `json:"id"`
	RoomID    string    `json:"room_id"`
	SenderID  string    `json:"sender_id"`
	SenderName string   `json:"sender_name"`
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
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
	ID          string    `json:"id"`
	FromUserID  string    `json:"from_user_id"`
	ToUserID    string    `json:"to_user_id"`
	Status      string    `json:"status"` // pending, accepted, rejected
	CreatedAt   time.Time `json:"created_at"`
}

type WatchHistory struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	RoomID    string    `json:"room_id"`
	RoomName  string    `json:"room_name"`
	VideoPath string    `json:"video_path"`
	WatchedAt time.Time `json:"watched_at"`
	Duration  int       `json:"duration"` // seconds watched
}

type Friend struct {
	ID           string    `json:"id"`
	FriendID     string    `json:"friend_id"`
	FriendName   string    `json:"friend_name"`
	FriendAvatar string    `json:"friend_avatar"`
	AddedAt      time.Time `json:"added_at"`
}
