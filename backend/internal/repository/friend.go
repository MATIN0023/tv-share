package repository

import (
	"database/sql"

	"watch-party/internal/models"
	"watch-party/internal/util"
)

func (r *Repository) SendFriendRequest(fromUserID, toUserID string) error {
	var count int
	_ = r.db.QueryRow(
		`SELECT COUNT(*) FROM friendships WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)`,
		fromUserID, toUserID, toUserID, fromUserID,
	).Scan(&count)
	if count > 0 {
		return sql.ErrNoRows
	}

	id := util.GenerateID()
	_, err := r.db.Exec(
		`INSERT INTO friendships (id, from_user_id, to_user_id, status) VALUES (?, ?, ?, 'pending')`,
		id, fromUserID, toUserID,
	)
	return err
}

func (r *Repository) AcceptFriendRequest(fromUserID, toUserID string) error {
	_, err := r.db.Exec(
		`UPDATE friendships SET status = 'accepted' WHERE from_user_id = ? AND to_user_id = ? AND status = 'pending'`,
		fromUserID, toUserID,
	)
	return err
}

func (r *Repository) RejectFriendRequest(fromUserID, toUserID string) error {
	_, err := r.db.Exec(
		`DELETE FROM friendships WHERE from_user_id = ? AND to_user_id = ? AND status = 'pending'`,
		fromUserID, toUserID,
	)
	return err
}

func (r *Repository) GetFriends(userID string) ([]models.Friend, error) {
	rows, err := r.db.Query(`
		SELECT f.id, u.id, u.display_name, u.avatar_url, f.created_at
		FROM friendships f
		JOIN users u ON (
			CASE WHEN f.from_user_id = ? THEN f.to_user_id = u.id
			     ELSE f.from_user_id = u.id END
		)
		WHERE (f.from_user_id = ? OR f.to_user_id = ?) AND f.status = 'accepted'
		ORDER BY f.created_at DESC
	`, userID, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var friends []models.Friend
	for rows.Next() {
		var fr models.Friend
		if err := rows.Scan(&fr.ID, &fr.FriendID, &fr.FriendName, &fr.FriendAvatar, &fr.AddedAt); err != nil {
			return nil, err
		}
		friends = append(friends, fr)
	}
	if friends == nil {
		friends = []models.Friend{}
	}
	return friends, nil
}

func (r *Repository) GetPendingRequests(userID string) ([]models.FriendRequest, error) {
	rows, err := r.db.Query(`
		SELECT id, from_user_id, to_user_id, status, created_at
		FROM friendships
		WHERE to_user_id = ? AND status = 'pending'
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reqs []models.FriendRequest
	for rows.Next() {
		var req models.FriendRequest
		if err := rows.Scan(&req.ID, &req.FromUserID, &req.ToUserID, &req.Status, &req.CreatedAt); err != nil {
			return nil, err
		}
		reqs = append(reqs, req)
	}
	if reqs == nil {
		reqs = []models.FriendRequest{}
	}
	return reqs, nil
}
