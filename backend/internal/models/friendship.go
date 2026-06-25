package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	FriendshipStatusPending  = "pending"
	FriendshipStatusAccepted = "accepted"
	FriendshipStatusRejected = "rejected"
)

// Friendship tracks friend requests and accepted friendships.
type Friendship struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FromUserID primitive.ObjectID `bson:"from_user_id" json:"from_user_id"`
	ToUserID   primitive.ObjectID `bson:"to_user_id" json:"to_user_id"`
	Status     string             `bson:"status" json:"status"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt  time.Time          `bson:"updated_at" json:"updated_at"`
}

// Friend is a denormalized friend list entry for API responses.
type Friend struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FriendID     primitive.ObjectID `bson:"friend_id" json:"friend_id"`
	FriendName   string             `bson:"friend_name" json:"friend_name"`
	FriendAvatar string             `bson:"friend_avatar" json:"friend_avatar"`
	AddedAt      time.Time          `bson:"added_at" json:"added_at"`
}

// FriendRequest is a pending friend request for API responses.
type FriendRequest struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FromUserID primitive.ObjectID `bson:"from_user_id" json:"from_user_id"`
	ToUserID   primitive.ObjectID `bson:"to_user_id" json:"to_user_id"`
	Status     string             `bson:"status" json:"status"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
}
