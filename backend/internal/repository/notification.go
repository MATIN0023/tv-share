package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"watch-party/internal/models"
)

func (r *Repository) ListNotifications(ctx context.Context, userID string) ([]models.Notification, error) {
	uid, err := parseObjectID(userID)
	if err != nil {
		return nil, err
	}
	cur, err := r.coll(collNotifications).Find(ctx, bson.M{"user_id": uid}, optionsFindDesc("created_at"))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var items []models.Notification
	if err := cur.All(ctx, &items); err != nil {
		return nil, err
	}
	if items == nil {
		items = []models.Notification{}
	}
	return items, nil
}

func (r *Repository) CreateNotification(ctx context.Context, n *models.Notification) error {
	if n.ID.IsZero() {
		n.ID = primitive.NewObjectID()
	}
	n.CreatedAt = models.NowUTC()
	_, err := r.coll(collNotifications).InsertOne(ctx, n)
	return err
}

func (r *Repository) MarkNotificationRead(ctx context.Context, userID, notifID string) error {
	uid, err := parseObjectID(userID)
	if err != nil {
		return err
	}
	nid, err := parseObjectID(notifID)
	if err != nil {
		return err
	}
	_, err = r.coll(collNotifications).UpdateOne(ctx,
		bson.M{"_id": nid, "user_id": uid},
		bson.M{"$set": bson.M{"is_read": true}},
	)
	return err
}

func (r *Repository) MarkAllNotificationsRead(ctx context.Context, userID string) error {
	uid, err := parseObjectID(userID)
	if err != nil {
		return err
	}
	_, err = r.coll(collNotifications).UpdateMany(ctx,
		bson.M{"user_id": uid, "is_read": false},
		bson.M{"$set": bson.M{"is_read": true}},
	)
	return err
}
