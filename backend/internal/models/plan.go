package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Plan struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Slug        string             `bson:"slug" json:"slug"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description,omitempty" json:"description"`
	Price       float64            `bson:"price" json:"price"`
	Currency    string             `bson:"currency" json:"currency"`
	DurationDays int               `bson:"duration_days" json:"duration_days"`
	Features    []string           `bson:"features,omitempty" json:"features"`
	IsActive    bool               `bson:"is_active" json:"is_active"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}
