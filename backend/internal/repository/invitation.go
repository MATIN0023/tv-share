package repository

import (
	"database/sql"
	"time"

	"watch-party/internal/models"
	"watch-party/internal/util"
)

func (r *Repository) CreateInvitation(roomID, code string, expiresAt time.Time, maxUses int) error {
	id := util.GenerateID()
	_, err := r.db.Exec(
		`INSERT INTO invitations (id, room_id, code, expires_at, max_uses) VALUES (?, ?, ?, ?, ?)`,
		id, roomID, code, expiresAt, maxUses,
	)
	return err
}

func (r *Repository) GetInvitationByCode(code string) (*models.Invitation, error) {
	row := r.db.QueryRow(`
		SELECT id, room_id, code, expires_at, max_uses, used_count
		FROM invitations WHERE code = ?
	`, code)
	i := &models.Invitation{}
	err := row.Scan(&i.ID, &i.RoomID, &i.Code, &i.ExpiresAt, &i.MaxUses, &i.UsedCount)
	if err != nil {
		return nil, err
	}
	return i, nil
}

func (r *Repository) ValidateInvitation(code string) (*models.Invitation, error) {
	i, err := r.GetInvitationByCode(code)
	if err != nil {
		return nil, err
	}
	if time.Now().After(i.ExpiresAt) {
		return nil, sql.ErrNoRows
	}
	if i.UsedCount >= i.MaxUses {
		return nil, sql.ErrNoRows
	}
	return i, nil
}

func (r *Repository) UseInvitation(code string) error {
	_, err := r.db.Exec(`UPDATE invitations SET used_count = used_count + 1 WHERE code = ?`, code)
	return err
}
