package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// VideoFeed is a public room entry for the discover feed.
type VideoFeed struct {
	RoomID      primitive.ObjectID `bson:"room_id" json:"room_id"`
	RoomName    string             `bson:"room_name" json:"room_name"`
	VideoPath   string             `bson:"video_path" json:"video_path"`
	OwnerID     primitive.ObjectID `bson:"owner_id" json:"owner_id"`
	OwnerName   string             `bson:"owner_name" json:"owner_name"`
	OwnerAvatar string             `bson:"owner_avatar" json:"owner_avatar"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}
