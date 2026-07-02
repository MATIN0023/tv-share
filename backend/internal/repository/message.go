package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"watch-party/internal/models"
)

func (r *Repository) SaveMessage(ctx context.Context, roomID, senderID, senderName, content string) (string, error) {
	roomOID, err := parseObjectID(roomID)
	if err != nil {
		return "", err
	}
	senderOID, err := parseObjectID(senderID)
	if err != nil {
		return "", err
	}
	msg := models.Message{
		ID:         primitive.NewObjectID(),
		RoomID:     roomOID,
		SenderID:   senderOID,
		SenderName: senderName,
		Content:    content,
		Timestamp:  models.NowUTC(),
	}
	_, err = r.coll(collMessages).InsertOne(ctx, msg)
	if err != nil {
		return "", err
	}
	return msg.ID.Hex(), nil
}

func (r *Repository) GetMessages(ctx context.Context, roomID string, limit int64) ([]models.Message, error) {
	roomOID, err := parseObjectID(roomID)
	if err != nil {
		return nil, err
	}
	cur, err := r.coll(collMessages).Find(ctx,
		bson.M{"room_id": roomOID},
		options.Find().SetSort(bson.D{{Key: "timestamp", Value: 1}}).SetLimit(limit),
	)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var msgs []models.Message
	if err := cur.All(ctx, &msgs); err != nil {
		return nil, err
	}
	if msgs == nil {
		msgs = []models.Message{}
	}
	return msgs, nil
}

func (r *Repository) GetAllMessagesForRoom(ctx context.Context, roomID string) ([]models.Message, error) {
	return r.GetMessages(ctx, roomID, 50000)
}
