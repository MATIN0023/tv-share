package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Ticket struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Subject   string             `bson:"subject" json:"subject"`
	Status    string             `bson:"status" json:"status"`
	Priority  string             `bson:"priority,omitempty" json:"priority"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type TicketMessage struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	TicketID  primitive.ObjectID `bson:"ticket_id" json:"ticket_id"`
	SenderID  primitive.ObjectID `bson:"sender_id" json:"sender_id"`
	Body      string             `bson:"body" json:"body"`
	IsStaff   bool               `bson:"is_staff" json:"is_staff"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}
