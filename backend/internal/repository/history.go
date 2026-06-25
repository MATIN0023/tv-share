package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"watch-party/internal/models"
)

func (r *Repository) RecordWatchHistory(ctx context.Context, userID, roomID, roomName, videoPath string) error {
	userOID, err := parseObjectID(userID)
	if err != nil {
		return err
	}
	roomOID, err := parseObjectID(roomID)
	if err != nil {
		return err
	}
	entry := models.WatchHistory{
		ID:        primitive.NewObjectID(),
		UserID:    userOID,
		RoomID:    roomOID,
		RoomName:  roomName,
		VideoPath: videoPath,
		WatchedAt: models.NowUTC(),
	}
	_, err = r.coll(collWatchHistory).InsertOne(ctx, entry)
	return err
}

func (r *Repository) GetWatchHistory(ctx context.Context, userID string, limit int64) ([]models.WatchHistory, error) {
	userOID, err := parseObjectID(userID)
	if err != nil {
		return nil, err
	}
	cur, err := r.coll(collWatchHistory).Find(ctx,
		bson.M{"user_id": userOID},
		options.Find().SetSort(bson.D{{Key: "watched_at", Value: -1}}).SetLimit(limit),
	)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var history []models.WatchHistory
	if err := cur.All(ctx, &history); err != nil {
		return nil, err
	}
	if history == nil {
		history = []models.WatchHistory{}
	}
	return history, nil
}

func (r *Repository) GetRoomHistory(ctx context.Context, userID string, limit int64) ([]models.Room, error) {
	userOID, err := parseObjectID(userID)
	if err != nil {
		return nil, err
	}
	pipeline := []bson.M{
		{"$match": bson.M{"user_id": userOID}},
		{"$sort": bson.M{"watched_at": -1}},
		{"$group": bson.M{
			"_id":         "$room_id",
			"last_watched": bson.M{"$first": "$watched_at"},
		}},
		{"$sort": bson.M{"last_watched": -1}},
		{"$limit": limit},
		{"$lookup": bson.M{
			"from":         collRooms,
			"localField":   "_id",
			"foreignField": "_id",
			"as":           "room",
		}},
		{"$unwind": "$room"},
		{"$replaceRoot": bson.M{"newRoot": "$room"}},
	}
	cur, err := r.coll(collWatchHistory).Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	return decodeRooms(cur, ctx)
}

func (r *Repository) UpsertVideoProgress(ctx context.Context, userID, videoID string, lastPosition int) error {
	userOID, err := parseObjectID(userID)
	if err != nil {
		return err
	}
	videoOID, err := parseObjectID(videoID)
	if err != nil {
		return err
	}
	now := models.NowUTC()
	_, err = r.coll(collWatchHistory).UpdateOne(ctx,
		bson.M{"user_id": userOID, "video_id": videoOID},
		bson.M{"$set": bson.M{
			"last_position": lastPosition,
			"watched_at":    now,
		}, "$setOnInsert": bson.M{
			"_id":      primitive.NewObjectID(),
			"user_id":  userOID,
			"video_id": videoOID,
		}},
		options.Update().SetUpsert(true),
	)
	return err
}
