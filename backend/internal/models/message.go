package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Message is a chat message in a room.
type Message struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	RoomID     primitive.ObjectID `bson:"room_id" json:"room_id"`
	SenderID   primitive.ObjectID `bson:"sender_id" json:"sender_id"`
	SenderName string             `bson:"sender_name" json:"sender_name"`
	Content    string             `bson:"content" json:"content"`
	Timestamp  time.Time          `bson:"timestamp" json:"timestamp"`
}
