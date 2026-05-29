package repository

import "watch-party/internal/models"

func (r *Repository) CreateRoom(id, name, ownerID, visibility, background string) error {
	_, err := r.db.Exec(
		`INSERT INTO rooms (id, name, owner_id, visibility, background) VALUES (?, ?, ?, ?, ?)`,
		id, name, ownerID, visibility, background,
	)
	return err
}

func (r *Repository) SearchRooms(query string) ([]models.Room, error) {
	rows, err := r.db.Query(`
		SELECT id, name, COALESCE(video_path, ''), owner_id, visibility, background, created_at
		FROM rooms
		WHERE name LIKE ? OR owner_id IN (
			SELECT id FROM users WHERE username LIKE ?
		)
		ORDER BY created_at DESC
		LIMIT 50
	`, "%"+query+"%", "%"+query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRooms(rows)
}

func (r *Repository) GetRoom(id string) (*models.Room, error) {
	row := r.db.QueryRow(`
		SELECT id, name, COALESCE(video_path, ''), owner_id, visibility, background, created_at,
		       COALESCE(is_playing, 0), COALESCE(current_time, 0),
		       COALESCE(is_paused, 0), COALESCE(duration, 0)
		FROM rooms WHERE id = ?
	`, id)
	room := &models.Room{}
	err := row.Scan(&room.ID, &room.Name, &room.VideoPath, &room.OwnerID, &room.Visibility, &room.Background, &room.CreatedAt,
		&room.IsPlaying, &room.CurrentTime, &room.IsPaused, &room.Duration)
	if err != nil {
		return nil, err
	}
	return room, nil
}

func (r *Repository) ListRooms() ([]models.Room, error) {
	rows, err := r.db.Query(`
		SELECT id, name, COALESCE(video_path, ''), owner_id, visibility, background, created_at
		FROM rooms ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRooms(rows)
}

func (r *Repository) ListPublicVideoFeeds(limit int) ([]models.VideoFeed, error) {
	rows, err := r.db.Query(`
		SELECT r.id, r.name, COALESCE(r.video_path, ''), r.owner_id,
		       u.display_name, COALESCE(u.avatar_url, ''), r.created_at
		FROM rooms r
		JOIN users u ON r.owner_id = u.id
		WHERE r.video_path != '' AND r.video_path IS NOT NULL
		  AND r.visibility = 'public'
		ORDER BY r.created_at DESC
		LIMIT ?
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var feeds []models.VideoFeed
	for rows.Next() {
		var f models.VideoFeed
		if err := rows.Scan(&f.RoomID, &f.RoomName, &f.VideoPath, &f.OwnerID,
			&f.OwnerName, &f.OwnerAvatar, &f.CreatedAt); err != nil {
			return nil, err
		}
		feeds = append(feeds, f)
	}
	if feeds == nil {
		feeds = []models.VideoFeed{}
	}
	return feeds, nil
}

func (r *Repository) UpdateRoomPlayback(room *models.Room) error {
	_, err := r.db.Exec(`
		UPDATE rooms SET
			is_playing = ?,
			current_time = ?,
			is_paused = ?,
			duration = ?
		WHERE id = ?
	`, room.IsPlaying, room.CurrentTime, room.IsPaused, room.Duration, room.ID)
	return err
}

func (r *Repository) UpdateRoomVideo(roomID, videoPath string) error {
	_, err := r.db.Exec(`UPDATE rooms SET video_path = ? WHERE id = ?`, videoPath, roomID)
	return err
}

func (r *Repository) DeleteRoom(id string) error {
	_, err := r.db.Exec(`DELETE FROM rooms WHERE id = ?`, id)
	return err
}

func scanRooms(rows interface {
	Next() bool
	Scan(dest ...interface{}) error
}) ([]models.Room, error) {
	var rooms []models.Room
	for rows.Next() {
		var room models.Room
		if err := rows.Scan(&room.ID, &room.Name, &room.VideoPath, &room.OwnerID, &room.Visibility, &room.Background, &room.CreatedAt); err != nil {
			return nil, err
		}
		rooms = append(rooms, room)
	}
	if rooms == nil {
		rooms = []models.Room{}
	}
	return rooms, nil
}
