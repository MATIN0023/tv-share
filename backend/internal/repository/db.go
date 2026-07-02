package repository

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	collUsers           = "users"
	collOTPs            = "otps"
	collRooms           = "rooms"
	collVideos          = "videos"
	collMessages        = "messages"
	collInvitations     = "invitations"
	collFriendships     = "friendships"
	collWatchHistory    = "watch_history"
	collScheduledVideos = "scheduled_videos"
	collTransactions    = "transactions"
	collPlans           = "plans"
	collReports         = "reports"
	collNotifications   = "notifications"
	collTickets         = "tickets"
	collTicketMsgs      = "ticket_messages"
	collSettings        = "settings"
	collDiscounts       = "discount_codes"
	collAuditLogs       = "audit_logs"
)

type Repository struct {
	client *mongo.Client
	db     *mongo.Database
}

func New(ctx context.Context, uri, dbName string) (*Repository, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("connect mongo: %w", err)
	}
	if err := client.Ping(ctx, nil); err != nil {
		return nil, fmt.Errorf("ping mongo: %w", err)
	}

	r := &Repository{client: client, db: client.Database(dbName)}
	if err := r.ensureIndexes(ctx); err != nil {
		return nil, err
	}
	log.Printf("Connected to MongoDB database %q", dbName)
	return r, nil
}

func (r *Repository) Close(ctx context.Context) error {
	return r.client.Disconnect(ctx)
}

func (r *Repository) coll(name string) *mongo.Collection {
	return r.db.Collection(name)
}

func isIndexConflict(err error) bool {
	if err == nil {
		return false
	}
	msg := err.Error()
	return strings.Contains(msg, "IndexKeySpecsConflict") ||
		strings.Contains(msg, "already exists with a different name")
}

func (r *Repository) ensureIndexes(ctx context.Context) error {
	type idx struct {
		collection string
		model      mongo.IndexModel
	}
	indexes := []idx{
		{collUsers, mongo.IndexModel{Keys: bson.D{{Key: "phone_number", Value: 1}}, Options: options.Index().SetUnique(true).SetName("uniq_phone_number")}},
		{collUsers, mongo.IndexModel{Keys: bson.D{{Key: "google_id", Value: 1}}, Options: options.Index().SetUnique(true).SetSparse(true).SetName("uniq_google_id")}},
		{collOTPs, mongo.IndexModel{Keys: bson.D{{Key: "phone_number", Value: 1}}, Options: options.Index().SetUnique(true).SetName("uniq_otp_phone")}},
		{collOTPs, mongo.IndexModel{Keys: bson.D{{Key: "expires_at", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(0).SetName("ttl_otp_expires")}},
		{collVideos, mongo.IndexModel{Keys: bson.D{{Key: "uploader_id", Value: 1}, {Key: "created_at", Value: -1}}, Options: options.Index().SetName("idx_video_uploader")}},
		{collRooms, mongo.IndexModel{Keys: bson.D{{Key: "slug", Value: 1}}, Options: options.Index().SetUnique(true).SetName("uniq_room_slug")}},
		{collInvitations, mongo.IndexModel{Keys: bson.D{{Key: "code", Value: 1}}, Options: options.Index().SetUnique(true).SetName("uniq_invite_code")}},
		{collFriendships, mongo.IndexModel{Keys: bson.D{{Key: "from_user_id", Value: 1}, {Key: "to_user_id", Value: 1}}, Options: options.Index().SetUnique(true).SetName("uniq_friendship")}},
		{collWatchHistory, mongo.IndexModel{Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "watched_at", Value: -1}}, Options: options.Index().SetName("idx_watch_user")}},
		{collTransactions, mongo.IndexModel{Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "created_at", Value: -1}}, Options: options.Index().SetName("idx_tx_user")}},
		{collPlans, mongo.IndexModel{Keys: bson.D{{Key: "slug", Value: 1}}, Options: options.Index().SetUnique(true).SetName("uniq_plan_slug")}},
		{collReports, mongo.IndexModel{Keys: bson.D{{Key: "status", Value: 1}, {Key: "created_at", Value: -1}}, Options: options.Index().SetName("idx_report_status")}},
		{collNotifications, mongo.IndexModel{Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "created_at", Value: -1}}, Options: options.Index().SetName("idx_notif_user")}},
		{collTickets, mongo.IndexModel{Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "created_at", Value: -1}}, Options: options.Index().SetName("idx_ticket_user")}},
		{collTicketMsgs, mongo.IndexModel{Keys: bson.D{{Key: "ticket_id", Value: 1}, {Key: "created_at", Value: 1}}, Options: options.Index().SetName("idx_ticket_msg")}},
		{collDiscounts, mongo.IndexModel{Keys: bson.D{{Key: "code", Value: 1}}, Options: options.Index().SetUnique(true).SetName("uniq_discount_code")}},
		{collMessages, mongo.IndexModel{Keys: bson.D{{Key: "room_id", Value: 1}, {Key: "timestamp", Value: 1}}, Options: options.Index().SetName("idx_message_room")}},
		{collMessages, mongo.IndexModel{Keys: bson.D{{Key: "timestamp", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(48 * 3600).SetName("ttl_message_48h")}},
	}
	for _, i := range indexes {
		if _, err := r.coll(i.collection).Indexes().CreateOne(ctx, i.model); err != nil && !isIndexConflict(err) {
			return fmt.Errorf("create index on %s: %w", i.collection, err)
		}
	}
	return nil
}
