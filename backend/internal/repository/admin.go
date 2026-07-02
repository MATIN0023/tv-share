package repository

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"watch-party/internal/models"
)

func (r *Repository) GetAdminStats(ctx context.Context) (*models.AdminStats, error) {
	stats := &models.AdminStats{}
	now := models.NowUTC()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	since7d := now.AddDate(0, 0, -7)
	since30d := now.AddDate(0, 0, -30)

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

	if stats.NewUsersToday, err = r.coll(collUsers).CountDocuments(ctx, bson.M{"created_at": bson.M{"$gte": startOfDay}}); err != nil {
		return nil, err
	}
	if stats.NewUsers7d, err = r.coll(collUsers).CountDocuments(ctx, bson.M{"created_at": bson.M{"$gte": since7d}}); err != nil {
		return nil, err
	}
	if stats.NewUsers30d, err = r.coll(collUsers).CountDocuments(ctx, bson.M{"created_at": bson.M{"$gte": since30d}}); err != nil {
		return nil, err
	}
	if stats.ActiveUsers7d, err = r.coll(collUsers).CountDocuments(ctx, bson.M{"last_login_at": bson.M{"$gte": since7d}}); err != nil {
		return nil, err
	}
	if stats.ActiveUsers30d, err = r.coll(collUsers).CountDocuments(ctx, bson.M{"last_login_at": bson.M{"$gte": since30d}}); err != nil {
		return nil, err
	}
	if stats.LoginsToday, err = r.coll(collAuditLogs).CountDocuments(ctx, bson.M{
		"action":     "login",
		"created_at": bson.M{"$gte": startOfDay},
	}); err != nil {
		return nil, err
	}

	if stats.FreeUsers, err = r.coll(collUsers).CountDocuments(ctx, bson.M{
		"$or": []bson.M{
			{"subscription_plan": models.SubscriptionPlanFree},
			{"subscription_plan": bson.M{"$exists": false}},
			{"subscription_plan": ""},
		},
	}); err != nil {
		return nil, err
	}
	if stats.GoogleAuthUsers, err = r.coll(collUsers).CountDocuments(ctx, bson.M{
		"auth_provider": bson.M{"$in": []string{models.AuthProviderGoogle, models.AuthProviderBoth}},
	}); err != nil {
		return nil, err
	}

	if stats.CompletedPayments, err = r.coll(collTransactions).CountDocuments(ctx, bson.M{"status": models.TransactionStatusCompleted}); err != nil {
		return nil, err
	}
	if stats.FailedPayments, err = r.coll(collTransactions).CountDocuments(ctx, bson.M{"status": models.TransactionStatusFailed}); err != nil {
		return nil, err
	}
	if stats.TotalRevenue, err = r.sumTransactionRevenue(ctx, bson.M{"status": models.TransactionStatusCompleted}); err != nil {
		return nil, err
	}
	if stats.Revenue30d, err = r.sumTransactionRevenue(ctx, bson.M{
		"status":     models.TransactionStatusCompleted,
		"created_at": bson.M{"$gte": since30d},
	}); err != nil {
		return nil, err
	}

	if stats.PendingFriendRequests, err = r.coll(collFriendships).CountDocuments(ctx, bson.M{"status": models.FriendshipStatusPending}); err != nil {
		return nil, err
	}
	if stats.TotalFriendships, err = r.coll(collFriendships).CountDocuments(ctx, bson.M{"status": models.FriendshipStatusAccepted}); err != nil {
		return nil, err
	}
	if stats.RoomsCreated7d, err = r.coll(collRooms).CountDocuments(ctx, bson.M{"created_at": bson.M{"$gte": since7d}}); err != nil {
		return nil, err
	}
	if stats.VideosUploaded7d, err = r.coll(collVideos).CountDocuments(ctx, bson.M{"created_at": bson.M{"$gte": since7d}}); err != nil {
		return nil, err
	}

	if stats.SignupTrend, err = r.signupTrend(ctx, 7); err != nil {
		return nil, err
	}

	roomOwners, err := r.coll(collRooms).Distinct(ctx, "owner_id", bson.M{})
	if err != nil {
		return nil, err
	}
	videoUploaders, err := r.coll(collVideos).Distinct(ctx, "uploader_id", bson.M{})
	if err != nil {
		return nil, err
	}
	usersWithFriend, err := r.coll(collUsers).CountDocuments(ctx, bson.M{"friends.0": bson.M{"$exists": true}})
	if err != nil {
		return nil, err
	}

	stats.Funnel = models.AdminFunnel{
		TotalUsers:      stats.TotalUsers,
		UsersWithRoom:   int64(len(roomOwners)),
		UsersWithVideo:  int64(len(videoUploaders)),
		UsersWithFriend: usersWithFriend,
		PaidUsers:       stats.PremiumUsers,
	}

	return stats, nil
}

func (r *Repository) sumTransactionRevenue(ctx context.Context, filter bson.M) (float64, error) {
	cur, err := r.coll(collTransactions).Aggregate(ctx, mongo.Pipeline{
		{{Key: "$match", Value: filter}},
		{{Key: "$group", Value: bson.M{
			"_id":   nil,
			"total": bson.M{"$sum": "$amount"},
		}}},
	})
	if err != nil {
		return 0, err
	}
	defer cur.Close(ctx)
	if !cur.Next(ctx) {
		return 0, nil
	}
	var row struct {
		Total float64 `bson:"total"`
	}
	if err := cur.Decode(&row); err != nil {
		return 0, err
	}
	return row.Total, nil
}

func (r *Repository) signupTrend(ctx context.Context, days int) ([]models.DailyCount, error) {
	now := models.NowUTC()
	start := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC).AddDate(0, 0, -(days - 1))

	cur, err := r.coll(collUsers).Aggregate(ctx, mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"created_at": bson.M{"$gte": start}}}},
		{{Key: "$group", Value: bson.M{
			"_id": bson.M{
				"$dateToString": bson.M{"format": "%Y-%m-%d", "date": "$created_at", "timezone": "UTC"},
			},
			"count": bson.M{"$sum": 1},
		}}},
		{{Key: "$sort", Value: bson.M{"_id": 1}}},
	})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	countsByDate := map[string]int64{}
	for cur.Next(ctx) {
		var row struct {
			ID    string `bson:"_id"`
			Count int64  `bson:"count"`
		}
		if err := cur.Decode(&row); err != nil {
			return nil, err
		}
		countsByDate[row.ID] = row.Count
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}

	out := make([]models.DailyCount, 0, days)
	for i := 0; i < days; i++ {
		d := start.AddDate(0, 0, i)
		key := d.Format("2006-01-02")
		out = append(out, models.DailyCount{Date: key, Count: countsByDate[key]})
	}
	return out, nil
}

func (r *Repository) ListLiveRooms(ctx context.Context) ([]models.Room, error) {
	cur, err := r.coll(collRooms).Find(ctx, bson.M{"status": models.RoomStatusActive}, optionsFindDesc("updated_at"))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	return decodeRooms(cur, ctx)
}
