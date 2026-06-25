package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Invitation is a room invite code.
type Invitation struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	RoomID    primitive.ObjectID `bson:"room_id" json:"room_id"`
	Code      string             `bson:"code" json:"code"`
	ExpiresAt time.Time          `bson:"expires_at" json:"expires_at"`
	MaxUses   int                `bson:"max_uses" json:"max_uses"`
	UsedCount int                `bson:"used_count" json:"used_count"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}
