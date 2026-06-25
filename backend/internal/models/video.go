package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Video is the MongoDB video asset document.
type Video struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UploaderID    primitive.ObjectID `bson:"uploader_id" json:"uploader_id"`
	Title         string             `bson:"title" json:"title"`
	OriginalURL   string             `bson:"original_url" json:"original_url"`
	HlsURL        string             `bson:"hls_url,omitempty" json:"hls_url,omitempty"`
	ProcessStatus string             `bson:"process_status" json:"process_status"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updated_at"`
}
