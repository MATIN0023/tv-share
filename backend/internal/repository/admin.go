package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"watch-party/internal/models"
)

func (r *Repository) GetAdminStats(ctx context.Context) (*models.AdminStats, error) {
	stats := &models.AdminStats{}
	var err error
	if stats.TotalUsers, err = r.coll(collUsers).CountDocuments(ctx, bson.M{}); err != nil {
		return nil, err
	}
	if stats.ActiveUsers, err = r.coll(collUsers).CountDocuments(ctx, bson.M{"is_active": true}); err != nil {
		return nil, err
	}
	if stats.BannedUsers, err = r.coll(collUsers).CountDocuments(ctx, bson.M{"is_active": false}); err != nil {
		return nil, err
	}
	if stats.TotalRooms, err = r.coll(collRooms).CountDocuments(ctx, bson.M{}); err != nil {
		return nil, err
	}
	if stats.LiveRooms, err = r.coll(collRooms).CountDocuments(ctx, bson.M{"status": models.RoomStatusActive}); err != nil {
		return nil, err
	}
	if stats.TotalVideos, err = r.coll(collVideos).CountDocuments(ctx, bson.M{}); err != nil {
		return nil, err
	}
	if stats.TotalTransactions, err = r.coll(collTransactions).CountDocuments(ctx, bson.M{}); err != nil {
		return nil, err
	}
	if stats.OpenReports, err = r.coll(collReports).CountDocuments(ctx, bson.M{"status": models.ReportStatusOpen}); err != nil {
		return nil, err
	}
	if stats.OpenTickets, err = r.coll(collTickets).CountDocuments(ctx, bson.M{"status": bson.M{"$in": []string{models.TicketStatusOpen, models.TicketStatusInProgress}}}); err != nil {
		return nil, err
	}
	if stats.PremiumUsers, err = r.coll(collUsers).CountDocuments(ctx, bson.M{"subscription_plan": models.SubscriptionPlanPremium}); err != nil {
		return nil, err
	}
	return stats, nil
}

func (r *Repository) ListLiveRooms(ctx context.Context) ([]models.Room, error) {
	cur, err := r.coll(collRooms).Find(ctx, bson.M{"status": models.RoomStatusActive}, optionsFindDesc("updated_at"))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	return decodeRooms(cur, ctx)
}
