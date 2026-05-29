package repository

import (
	"watch-party/internal/models"
	"watch-party/internal/util"
)

func (r *Repository) RecordWatchHistory(userID, roomID, roomName, videoPath string) error {
	id := util.GenerateID()
	_, err := r.db.Exec(
		`INSERT INTO watch_history (id, user_id, room_id, room_name, video_path) VALUES (?, ?, ?, ?, ?)`,
		id, userID, roomID, roomName, videoPath,
	)
	return err
}

func (r *Repository) GetWatchHistory(userID string, limit int) ([]models.WatchHistory, error) {
	rows, err := r.db.Query(`
		SELECT id, user_id, room_id, room_name, video_path, watched_at, duration
		FROM watch_history
		WHERE user_id = ?
		ORDER BY watched_at DESC
		LIMIT ?
	`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []models.WatchHistory
	for rows.Next() {
		var h models.WatchHistory
		if err := rows.Scan(&h.ID, &h.UserID, &h.RoomID, &h.RoomName, &h.VideoPath, &h.WatchedAt, &h.Duration); err != nil {
			return nil, err
		}
		history = append(history, h)
	}
	if history == nil {
		history = []models.WatchHistory{}
	}
	return history, nil
}

func (r *Repository) GetRoomHistory(userID string, limit int) ([]models.Room, error) {
	rows, err := r.db.Query(`
		SELECT DISTINCT r.id, r.name, COALESCE(r.video_path, ''), r.owner_id, r.visibility, r.background, r.created_at
		FROM rooms r
		JOIN watch_history wh ON r.id = wh.room_id
		WHERE wh.user_id = ?
		ORDER BY wh.watched_at DESC
		LIMIT ?
	`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRooms(rows)
}
