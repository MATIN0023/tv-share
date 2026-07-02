package ws

import (
	"time"

	"watch-party/internal/models"
)

type UserInfo struct {
	UserID    string    `json:"user_id"`
	Phone     string    `json:"phone_number"`
	AvatarURL string    `json:"avatar_url"`
	IsActive  bool      `json:"is_active"`
	LastSeen  time.Time `json:"last_seen"`
}

type Message struct {
	Type        string       `json:"type"`
	Text        string       `json:"text,omitempty"`
	From        string       `json:"from,omitempty"`
	FromID      string       `json:"from_id,omitempty"`
	Time        string       `json:"time,omitempty"`
	RoomID      string       `json:"room_id,omitempty"`
	Video       string       `json:"video,omitempty"`
	IsPlaying   bool         `json:"is_playing,omitempty"`
	CurrentTime float64      `json:"current_time,omitempty"`
	Duration    float64      `json:"duration,omitempty"`
	Emoji       string       `json:"emoji,omitempty"`
	UserInfo    *UserInfo    `json:"user_info,omitempty"`
	RoomInfo    *models.Room `json:"room_info,omitempty"`
}
