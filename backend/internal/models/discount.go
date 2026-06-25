package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	DiscountTypePercent = "percent"
	DiscountTypeFixed   = "fixed"
)

type DiscountCode struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Code            string             `bson:"code" json:"code"`
	Description     string             `bson:"description,omitempty" json:"description"`
	DiscountType    string             `bson:"discount_type" json:"discount_type"`
	DiscountPercent float64            `bson:"discount_percent,omitempty" json:"discount_percent,omitempty"`
	DiscountAmount  float64            `bson:"discount_amount,omitempty" json:"discount_amount,omitempty"`
	MaxUses         int                `bson:"max_uses" json:"max_uses"`
	UsedCount       int                `bson:"used_count" json:"used_count"`
	ValidFrom       time.Time          `bson:"valid_from" json:"valid_from"`
	ValidUntil      time.Time          `bson:"valid_until" json:"valid_until"`
	PlanSlugs       []string           `bson:"plan_slugs,omitempty" json:"plan_slugs,omitempty"`
	IsActive        bool               `bson:"is_active" json:"is_active"`
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time          `bson:"updated_at" json:"updated_at"`
}
