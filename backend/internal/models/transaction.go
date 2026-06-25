package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Transaction records a payment attempt (Phase 3).
type Transaction struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID           primitive.ObjectID `bson:"user_id" json:"user_id"`
	Amount           float64            `bson:"amount" json:"amount"`
	PlanSlug         string             `bson:"plan_slug,omitempty" json:"plan_slug,omitempty"`
	DiscountCode     string             `bson:"discount_code,omitempty" json:"discount_code,omitempty"`
	DiscountAmount   float64            `bson:"discount_amount,omitempty" json:"discount_amount,omitempty"`
	Status           string             `bson:"status" json:"status"`
	GatewayReference string             `bson:"gateway_reference" json:"gateway_reference"`
	CreatedAt        time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt        time.Time          `bson:"updated_at" json:"updated_at"`
}
