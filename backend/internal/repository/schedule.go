package repository

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"watch-party/internal/models"
)

func (r *Repository) CreateScheduledVideo(ctx context.Context, roomID, createdBy, title, description, videoURL string, scheduledFor time.Time) (*models.ScheduledVideo, error) {
	roomOID, err := parseObjectID(roomID)
	if err != nil {
		return nil, err
	}
	creatorOID, err := parseObjectID(createdBy)
	if err != nil {
		return nil, err
	}
	now := models.NowUTC()
	sv := models.ScheduledVideo{
		ID:           primitive.NewObjectID(),
		RoomID:       roomOID,
		Title:        title,
		Description:  description,
		VideoURL:     videoURL,
		ScheduledFor: scheduledFor.UTC(),
		CreatedBy:    creatorOID,
		IsPlayed:     false,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	_, err = r.coll(collScheduledVideos).InsertOne(ctx, sv)
	if err != nil {
		return nil, err
	}
	return &sv, nil
}

func (r *Repository) GetScheduledVideos(ctx context.Context, createdBy, status string) ([]models.ScheduledVideo, error) {
	creatorOID, err := parseObjectID(createdBy)
	if err != nil {
		return nil, err
	}
	filter := bson.M{"created_by": creatorOID}
	if status == "played" {
		filter["is_played"] = true
	} else if status == "pending" {
		filter["is_played"] = false
	}
	cur, err := r.coll(collScheduledVideos).Find(ctx, filter, optionsFindAsc("scheduled_for"))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var videos []models.ScheduledVideo
	if err := cur.All(ctx, &videos); err != nil {
		return nil, err
	}
	if videos == nil {
		videos = []models.ScheduledVideo{}
	}
	return videos, nil
}

func (r *Repository) CompleteScheduledVideo(ctx context.Context, id string) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	_, err = r.coll(collScheduledVideos).UpdateByID(ctx, oid, bson.M{"$set": bson.M{
		"is_played":  true,
		"updated_at": models.NowUTC(),
	}})
	return err
}

func (r *Repository) DeleteScheduledVideo(ctx context.Context, id string) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	_, err = r.coll(collScheduledVideos).DeleteOne(ctx, bson.M{"_id": oid})
	return err
}
