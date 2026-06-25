package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// WatchHistory records per-user viewing activity (Phase 2).
type WatchHistory struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID       primitive.ObjectID `bson:"user_id" json:"user_id"`
	VideoID      primitive.ObjectID `bson:"video_id,omitempty" json:"video_id,omitempty"`
	RoomID       primitive.ObjectID `bson:"room_id,omitempty" json:"room_id"`
	RoomName     string             `bson:"room_name,omitempty" json:"room_name"`
	VideoPath    string             `bson:"video_path,omitempty" json:"video_path"`
	WatchedAt    time.Time          `bson:"watched_at" json:"watched_at"`
	LastPosition int                `bson:"last_position" json:"last_position"`
	Duration     int                `bson:"duration" json:"duration"`
}
