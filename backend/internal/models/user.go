package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User is the MongoDB user document. PhoneNumber is the primary login identifier.
type User struct {
	ID                    primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	PhoneNumber           string               `bson:"phone_number" json:"phone_number"`
	PasswordHash          string               `bson:"password_hash,omitempty" json:"-"`
	DisplayName           string               `bson:"display_name,omitempty" json:"display_name"`
	AvatarURL             string               `bson:"avatar_url,omitempty" json:"avatar_url"`
	Email                 string               `bson:"email,omitempty" json:"email"`
	FamilyName            string               `bson:"family_name,omitempty" json:"family_name"`
	Birthday              *time.Time           `bson:"birthday,omitempty" json:"birthday"`
	Gender                string               `bson:"gender,omitempty" json:"gender"`
	Phone                 string               `bson:"phone,omitempty" json:"phone"`
	Country               string               `bson:"country,omitempty" json:"country"`
	City                  string               `bson:"city,omitempty" json:"city"`
	Bio                   string               `bson:"bio,omitempty" json:"bio"`
	Role                  string               `bson:"role" json:"role"`
	SubscriptionPlan      string               `bson:"subscription_plan" json:"subscription_plan"`
	SubscriptionExpiresAt time.Time            `bson:"subscription_expires_at,omitempty" json:"subscription_expires_at,omitempty"`
	BlockedUsers          []primitive.ObjectID `bson:"blocked_users,omitempty" json:"blocked_users,omitempty"`
	Friends               []primitive.ObjectID `bson:"friends,omitempty" json:"friends,omitempty"`
	IsActive              bool                 `bson:"is_active" json:"is_active"`
	CreatedAt             time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt             time.Time            `bson:"updated_at" json:"updated_at"`
	LastLoginAt           time.Time            `bson:"last_login_at,omitempty" json:"last_login_at,omitempty"`
}

// OTP stores a one-time verification code for phone login / recovery.
type OTP struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PhoneNumber string             `bson:"phone_number" json:"phone_number"`
	Code        string             `bson:"code" json:"code"`
	ExpiresAt   time.Time          `bson:"expires_at" json:"expires_at"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}
