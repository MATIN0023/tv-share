package repository

import (
	"watch-party/internal/models"
	"watch-party/internal/util"
)

func (r *Repository) SaveMessage(roomID, senderID, senderName, content string) (string, error) {
	id := util.GenerateID()
	_, err := r.db.Exec(
		`INSERT INTO messages (id, room_id, sender_id, sender_name, content) VALUES (?, ?, ?, ?, ?)`,
		id, roomID, senderID, senderName, content,
	)
	return id, err
}

func (r *Repository) GetMessages(roomID string, limit int) ([]models.Message, error) {
	rows, err := r.db.Query(`
		SELECT id, room_id, sender_id, sender_name, content, timestamp
		FROM messages
		WHERE room_id = ?
		ORDER BY timestamp ASC
		LIMIT ?
	`, roomID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var msgs []models.Message
	for rows.Next() {
		var m models.Message
		if err := rows.Scan(&m.ID, &m.RoomID, &m.SenderID, &m.SenderName, &m.Content, &m.Timestamp); err != nil {
			return nil, err
		}
		msgs = append(msgs, m)
	}
	if msgs == nil {
		msgs = []models.Message{}
	}
	return msgs, nil
}
