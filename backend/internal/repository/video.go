package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"watch-party/internal/models"
)

func (r *Repository) CreateVideo(ctx context.Context, uploaderID, title, originalURL string) (*models.Video, error) {
	uploaderOID, err := parseObjectID(uploaderID)
	if err != nil {
		return nil, err
	}
	now := models.NowUTC()
	video := models.Video{
		ID:            primitive.NewObjectID(),
		UploaderID:    uploaderOID,
		Title:         title,
		OriginalURL:   originalURL,
		ProcessStatus: models.VideoProcessStatusPending,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
	_, err = r.coll(collVideos).InsertOne(ctx, video)
	if err != nil {
		return nil, err
	}
	return &video, nil
}

func (r *Repository) GetVideo(ctx context.Context, id string) (*models.Video, error) {
	oid, err := parseObjectID(id)
	if err != nil {
		return nil, err
	}
	var video models.Video
	err = r.coll(collVideos).FindOne(ctx, bson.M{"_id": oid}).Decode(&video)
	if err != nil {
		return nil, err
	}
	return &video, nil
}

func (r *Repository) UpdateVideoProcessStatus(ctx context.Context, id, status, hlsURL string) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	update := bson.M{
		"process_status": status,
		"updated_at":     models.NowUTC(),
	}
	if hlsURL != "" {
		update["hls_url"] = hlsURL
	}
	_, err = r.coll(collVideos).UpdateByID(ctx, oid, bson.M{"$set": update})
	return err
}

func (r *Repository) DeleteVideo(ctx context.Context, id string) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	_, err = r.coll(collVideos).DeleteOne(ctx, bson.M{"_id": oid})
	return err
}

func (r *Repository) ListVideosByUploader(ctx context.Context, uploaderID string) ([]models.Video, error) {
	uploaderOID, err := parseObjectID(uploaderID)
	if err != nil {
		return nil, err
	}
	cur, err := r.coll(collVideos).Find(ctx, bson.M{"uploader_id": uploaderOID}, optionsFindDesc("created_at"))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var videos []models.Video
	if err := cur.All(ctx, &videos); err != nil {
		return nil, err
	}
	if videos == nil {
		videos = []models.Video{}
	}
	return videos, nil
}
