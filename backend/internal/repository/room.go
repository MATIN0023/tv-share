package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"watch-party/internal/models"
	"watch-party/internal/util"
)

func (r *Repository) CreateRoom(ctx context.Context, name, ownerID, visibility, background string) (*models.Room, error) {
	ownerOID, err := parseObjectID(ownerID)
	if err != nil {
		return nil, err
	}
	now := models.NowUTC()
	room := models.Room{
		ID:          primitive.NewObjectID(),
		OwnerID:     ownerOID,
		Slug:        util.GenerateInviteCode(),
		Title:       name,
		Visibility:  visibility,
		Background:  background,
		IsPublic:    visibility == "public",
		Status:      models.RoomStatusActive,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	_, err = r.coll(collRooms).InsertOne(ctx, room)
	if err != nil {
		return nil, err
	}
	return &room, nil
}

func (r *Repository) SearchRooms(ctx context.Context, query string) ([]models.Room, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"title": bson.M{"$regex": query, "$options": "i"}},
			{"slug": bson.M{"$regex": query, "$options": "i"}},
		},
	}
	cur, err := r.coll(collRooms).Find(ctx, filter, options.Find().SetLimit(50).SetSort(bson.D{{Key: "created_at", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	return decodeRooms(cur, ctx)
}

func (r *Repository) GetRoom(ctx context.Context, id string) (*models.Room, error) {
	oid, err := parseObjectID(id)
	if err != nil {
		return nil, err
	}
	var room models.Room
	err = r.coll(collRooms).FindOne(ctx, bson.M{"_id": oid}).Decode(&room)
	if err != nil {
		return nil, err
	}
	return &room, nil
}

func (r *Repository) GetRoomBySlug(ctx context.Context, slug string) (*models.Room, error) {
	var room models.Room
	err := r.coll(collRooms).FindOne(ctx, bson.M{"slug": slug}).Decode(&room)
	if err != nil {
		return nil, err
	}
	return &room, nil
}

func (r *Repository) ListRooms(ctx context.Context) ([]models.Room, error) {
	cur, err := r.coll(collRooms).Find(ctx, bson.M{}, optionsFindDesc("created_at"))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	return decodeRooms(cur, ctx)
}

func (r *Repository) ListPublicVideoFeeds(ctx context.Context, limit int64) ([]models.VideoFeed, error) {
	pipeline := []bson.M{
		{"$match": bson.M{
			"is_public": true,
			"video_url": bson.M{"$ne": ""},
			"status":    models.RoomStatusActive,
		}},
		{"$sort": bson.M{"created_at": -1}},
		{"$limit": limit},
		{"$lookup": bson.M{
			"from":         collUsers,
			"localField":   "owner_id",
			"foreignField": "_id",
			"as":           "owner",
		}},
		{"$unwind": bson.M{"path": "$owner", "preserveNullAndEmptyArrays": true}},
		{"$project": bson.M{
			"room_id":       "$_id",
			"room_name":     "$title",
			"video_path":    "$video_url",
			"owner_id":      "$owner_id",
			"owner_name":    "$owner.display_name",
			"owner_avatar":  "$owner.avatar_url",
			"created_at":    "$created_at",
		}},
	}
	cur, err := r.coll(collRooms).Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var feeds []models.VideoFeed
	if err := cur.All(ctx, &feeds); err != nil {
		return nil, err
	}
	if feeds == nil {
		feeds = []models.VideoFeed{}
	}
	return feeds, nil
}

func (r *Repository) UpdateRoomPlayback(ctx context.Context, room *models.Room) error {
	room.UpdatedAt = models.NowUTC()
	_, err := r.coll(collRooms).UpdateByID(ctx, room.ID, bson.M{"$set": bson.M{
		"is_playing":   room.IsPlaying,
		"current_time": room.CurrentTime,
		"is_paused":    room.IsPaused,
		"duration":     room.Duration,
		"updated_at":   room.UpdatedAt,
	}})
	return err
}

func (r *Repository) UpdateRoomVideo(ctx context.Context, roomID, videoURL string) error {
	oid, err := parseObjectID(roomID)
	if err != nil {
		return err
	}
	_, err = r.coll(collRooms).UpdateByID(ctx, oid, bson.M{"$set": bson.M{
		"video_url":  videoURL,
		"updated_at": models.NowUTC(),
	}})
	return err
}

func (r *Repository) DeleteRoom(ctx context.Context, id string) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	_, err = r.coll(collRooms).DeleteOne(ctx, bson.M{"_id": oid})
	return err
}

func decodeRooms(cur interface {
	All(context.Context, interface{}) error
}, ctx context.Context) ([]models.Room, error) {
	var rooms []models.Room
	if err := cur.All(ctx, &rooms); err != nil {
		return nil, err
	}
	if rooms == nil {
		rooms = []models.Room{}
	}
	return rooms, nil
}
