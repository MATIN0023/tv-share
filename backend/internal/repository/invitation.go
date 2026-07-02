package repository

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"watch-party/internal/models"
	"watch-party/internal/util"
)

func (r *Repository) CreateInvitation(ctx context.Context, roomID, code string, expiresAt time.Time, maxUses int) error {
	roomOID, err := parseObjectID(roomID)
	if err != nil {
		return err
	}
	inv := models.Invitation{
		ID:        primitive.NewObjectID(),
		RoomID:    roomOID,
		Code:      code,
		ExpiresAt: expiresAt.UTC(),
		MaxUses:   maxUses,
		UsedCount: 0,
		CreatedAt: models.NowUTC(),
	}
	_, err = r.coll(collInvitations).InsertOne(ctx, inv)
	return err
}

func normalizeInviteCode(code string) string {
	return util.NormalizeInviteCode(code)
}

func (r *Repository) GetInvitationByCode(ctx context.Context, code string) (*models.Invitation, error) {
	code = normalizeInviteCode(code)
	var inv models.Invitation
	err := r.coll(collInvitations).FindOne(ctx, bson.M{"code": code}).Decode(&inv)
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (r *Repository) ValidateInvitation(ctx context.Context, code string) (*models.Invitation, error) {
	inv, err := r.GetInvitationByCode(ctx, code)
	if err != nil {
		return nil, err
	}
	if time.Now().UTC().After(inv.ExpiresAt) {
		return nil, mongo.ErrNoDocuments
	}
	if inv.UsedCount >= inv.MaxUses {
		return nil, mongo.ErrNoDocuments
	}
	return inv, nil
}

func (r *Repository) UseInvitation(ctx context.Context, code string) error {
	code = normalizeInviteCode(code)
	res, err := r.coll(collInvitations).UpdateOne(ctx,
		bson.M{"code": code},
		bson.M{"$inc": bson.M{"used_count": 1}},
	)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("invitation not found")
	}
	return nil
}
