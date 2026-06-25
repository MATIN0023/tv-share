package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Room is the MongoDB watch-room document.
type Room struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	OwnerID     primitive.ObjectID  `bson:"owner_id" json:"owner_id"`
	Slug        string              `bson:"slug" json:"slug"`
	Title       string              `bson:"title" json:"name"`
	VideoURL    string              `bson:"video_url,omitempty" json:"video_path"`
	VideoID     primitive.ObjectID  `bson:"video_id,omitempty" json:"video_id,omitempty"`
	Visibility  string              `bson:"visibility" json:"visibility"`
	Background  string              `bson:"background" json:"background"`
	IsPublic    bool                `bson:"is_public" json:"is_public"`
	Status      string              `bson:"status" json:"status"`
	IsPlaying   bool                `bson:"is_playing" json:"is_playing"`
	CurrentTime float64             `bson:"current_time" json:"current_time"`
	IsPaused    bool                `bson:"is_paused" json:"is_paused"`
	Duration    float64             `bson:"duration" json:"duration"`
	CreatedAt   time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time           `bson:"updated_at" json:"updated_at"`
}
