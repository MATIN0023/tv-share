package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ScheduledVideo is a video scheduled for future playback in a room.
type ScheduledVideo struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	RoomID       primitive.ObjectID `bson:"room_id" json:"room_id"`
	Title        string             `bson:"title" json:"title"`
	Description  string             `bson:"description,omitempty" json:"description"`
	VideoURL     string             `bson:"video_url" json:"video_url"`
	ScheduledFor time.Time          `bson:"scheduled_for" json:"scheduled_for"`
	CreatedBy    primitive.ObjectID `bson:"created_by" json:"created_by"`
	IsPlayed     bool               `bson:"is_played" json:"is_played"`
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updated_at"`
}
