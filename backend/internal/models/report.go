package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Report struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ReporterID  primitive.ObjectID `bson:"reporter_id" json:"reporter_id"`
	TargetType  string             `bson:"target_type" json:"target_type"`
	TargetID    string             `bson:"target_id" json:"target_id"`
	Reason      string             `bson:"reason" json:"reason"`
	Status      string             `bson:"status" json:"status"`
	ResolvedBy  primitive.ObjectID `bson:"resolved_by,omitempty" json:"resolved_by,omitempty"`
	ResolvedAt  time.Time          `bson:"resolved_at,omitempty" json:"resolved_at,omitempty"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}
