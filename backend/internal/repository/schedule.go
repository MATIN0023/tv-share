package repository

import (
	"database/sql"
	"time"

	"watch-party/internal/models"
)

func (r *Repository) CreateScheduledVideo(id, roomID, createdBy, title, description, videoURL string, scheduledFor time.Time) error {
	_, err := r.db.Exec(`
		INSERT INTO scheduled_videos (id, room_id, title, description, video_url, scheduled_for, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, id, roomID, title, description, videoURL, scheduledFor, createdBy)
	return err
}

func (r *Repository) GetScheduledVideos(createdBy, status string) ([]models.ScheduledVideo, error) {
	var rows *sql.Rows
	var err error

	if status == "" || status == "all" {
		rows, err = r.db.Query(`
			SELECT id, room_id, title, description, video_url, scheduled_for, created_at, created_by, is_played
			FROM scheduled_videos
			WHERE created_by = ?
			ORDER BY scheduled_for ASC
		`, createdBy)
	} else {
		played := status == "played"
		rows, err = r.db.Query(`
			SELECT id, room_id, title, description, video_url, scheduled_for, created_at, created_by, is_played
			FROM scheduled_videos
			WHERE created_by = ? AND is_played = ?
			ORDER BY scheduled_for ASC
		`, createdBy, played)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var videos []models.ScheduledVideo
	for rows.Next() {
		var v models.ScheduledVideo
		var isPlayed int
		if err := rows.Scan(&v.ID, &v.RoomID, &v.Title, &v.Description, &v.VideoURL, &v.ScheduledFor, &v.CreatedAt, &v.CreatedBy, &isPlayed); err != nil {
			return nil, err
		}
		v.IsPlayed = isPlayed == 1
		videos = append(videos, v)
	}
	if videos == nil {
		videos = []models.ScheduledVideo{}
	}
	return videos, nil
}

func (r *Repository) CompleteScheduledVideo(id string) error {
	_, err := r.db.Exec(`UPDATE scheduled_videos SET is_played = 1 WHERE id = ?`, id)
	return err
}

func (r *Repository) DeleteScheduledVideo(id string) error {
	_, err := r.db.Exec(`DELETE FROM scheduled_videos WHERE id = ?`, id)
	return err
}
