package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuditLog struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ActorID    primitive.ObjectID `bson:"actor_id" json:"actor_id"`
	ActorPhone string             `bson:"actor_phone,omitempty" json:"actor_phone,omitempty"`
	ActorName  string             `bson:"actor_name,omitempty" json:"actor_name,omitempty"`
	ActorRole  string             `bson:"actor_role,omitempty" json:"actor_role,omitempty"`
	Action     string             `bson:"action" json:"action"`
	TargetType string             `bson:"target_type,omitempty" json:"target_type,omitempty"`
	TargetID   string             `bson:"target_id,omitempty" json:"target_id,omitempty"`
	Details    string             `bson:"details,omitempty" json:"details,omitempty"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
}
