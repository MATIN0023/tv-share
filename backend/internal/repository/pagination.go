package repository

import (
	"context"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"watch-party/internal/models"
)

func parsePageLimit(page, limit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return page, limit
}

func (r *Repository) ListUsersPaginated(ctx context.Context, search string, page, limit int) (*models.PaginatedResult[models.User], error) {
	page, limit = parsePageLimit(page, limit)
	filter := bson.M{}
	if s := strings.TrimSpace(search); s != "" {
		or := []bson.M{
			{"display_name": bson.M{"$regex": s, "$options": "i"}},
			{"phone_number": bson.M{"$regex": s, "$options": "i"}},
			{"role": bson.M{"$regex": s, "$options": "i"}},
		}
		if oid, err := primitive.ObjectIDFromHex(s); err == nil {
			or = append(or, bson.M{"_id": oid})
		}
		filter["$or"] = or
	}
	total, err := r.coll(collUsers).CountDocuments(ctx, filter)
	if err != nil {
		return nil, err
	}
	skip := int64((page - 1) * limit)
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetSkip(skip).SetLimit(int64(limit))
	cur, err := r.coll(collUsers).Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var users []models.User
	if err := cur.All(ctx, &users); err != nil {
		return nil, err
	}
	if users == nil {
		users = []models.User{}
	}
	return &models.PaginatedResult[models.User]{Items: users, Total: total, Page: page, Limit: limit}, nil
}

func (r *Repository) ListRoomsPaginated(ctx context.Context, status, search string, page, limit int) (*models.PaginatedResult[models.Room], error) {
	page, limit = parsePageLimit(page, limit)
	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}
	if s := strings.TrimSpace(search); s != "" {
		filter["$or"] = []bson.M{
			{"title": bson.M{"$regex": s, "$options": "i"}},
			{"slug": bson.M{"$regex": s, "$options": "i"}},
		}
	}
	total, err := r.coll(collRooms).CountDocuments(ctx, filter)
	if err != nil {
		return nil, err
	}
	skip := int64((page - 1) * limit)
	opts := options.Find().SetSort(bson.D{{Key: "updated_at", Value: -1}}).SetSkip(skip).SetLimit(int64(limit))
	cur, err := r.coll(collRooms).Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	rooms, err := decodeRooms(cur, ctx)
	if err != nil {
		return nil, err
	}
	return &models.PaginatedResult[models.Room]{Items: rooms, Total: total, Page: page, Limit: limit}, nil
}

func (r *Repository) CloseRoom(ctx context.Context, id string) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	_, err = r.coll(collRooms).UpdateByID(ctx, oid, bson.M{"$set": bson.M{
		"status":     models.RoomStatusInactive,
		"is_playing": false,
		"updated_at": models.NowUTC(),
	}})
	return err
}

func (r *Repository) ListReportsPaginated(ctx context.Context, status, targetType string, page, limit int) (*models.PaginatedResult[models.Report], error) {
	page, limit = parsePageLimit(page, limit)
	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}
	if targetType != "" {
		filter["target_type"] = targetType
	}
	total, err := r.coll(collReports).CountDocuments(ctx, filter)
	if err != nil {
		return nil, err
	}
	skip := int64((page - 1) * limit)
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetSkip(skip).SetLimit(int64(limit))
	cur, err := r.coll(collReports).Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var reports []models.Report
	if err := cur.All(ctx, &reports); err != nil {
		return nil, err
	}
	if reports == nil {
		reports = []models.Report{}
	}
	return &models.PaginatedResult[models.Report]{Items: reports, Total: total, Page: page, Limit: limit}, nil
}

func (r *Repository) ListTransactionsPaginated(ctx context.Context, page, limit int) (*models.PaginatedResult[models.Transaction], error) {
	page, limit = parsePageLimit(page, limit)
	total, err := r.coll(collTransactions).CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	skip := int64((page - 1) * limit)
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetSkip(skip).SetLimit(int64(limit))
	cur, err := r.coll(collTransactions).Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var txs []models.Transaction
	if err := cur.All(ctx, &txs); err != nil {
		return nil, err
	}
	if txs == nil {
		txs = []models.Transaction{}
	}
	return &models.PaginatedResult[models.Transaction]{Items: txs, Total: total, Page: page, Limit: limit}, nil
}

func (r *Repository) ListAuditLogsPaginated(ctx context.Context, page, limit int) (*models.PaginatedResult[models.AuditLog], error) {
	page, limit = parsePageLimit(page, limit)
	total, err := r.coll(collAuditLogs).CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	skip := int64((page - 1) * limit)
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetSkip(skip).SetLimit(int64(limit))
	cur, err := r.coll(collAuditLogs).Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var logs []models.AuditLog
	if err := cur.All(ctx, &logs); err != nil {
		return nil, err
	}
	if logs == nil {
		logs = []models.AuditLog{}
	}
	return &models.PaginatedResult[models.AuditLog]{Items: logs, Total: total, Page: page, Limit: limit}, nil
}

func (r *Repository) WriteAuditLog(ctx context.Context, actorID, action, targetType, targetID, details string) error {
	return r.WriteActivityLog(ctx, actorID, "", action, targetType, targetID, details)
}

func (r *Repository) WriteActivityLog(ctx context.Context, actorID, actorRole, action, targetType, targetID, details string) error {
	aid, err := parseObjectID(actorID)
	if err != nil {
		return err
	}
	entry := models.AuditLog{
		ID:         primitive.NewObjectID(),
		ActorID:    aid,
		ActorRole:  actorRole,
		Action:     action,
		TargetType: targetType,
		TargetID:   targetID,
		Details:    details,
		CreatedAt:  models.NowUTC(),
	}
	if user, err := r.GetUserByID(ctx, actorID); err == nil {
		entry.ActorPhone = user.PhoneNumber
		if user.DisplayName != "" {
			entry.ActorName = user.DisplayName
		} else {
			entry.ActorName = user.PhoneNumber
		}
		if entry.ActorRole == "" {
			entry.ActorRole = user.Role
		}
	}
	_, err = r.coll(collAuditLogs).InsertOne(ctx, entry)
	return err
}

func (r *Repository) ListActivityLogsForUser(ctx context.Context, userID string, page, limit int) (*models.PaginatedResult[models.AuditLog], error) {
	page, limit = parsePageLimit(page, limit)
	uid, err := parseObjectID(userID)
	if err != nil {
		return nil, err
	}
	filter := bson.M{"actor_id": uid}
	total, err := r.coll(collAuditLogs).CountDocuments(ctx, filter)
	if err != nil {
		return nil, err
	}
	skip := int64((page - 1) * limit)
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetSkip(skip).SetLimit(int64(limit))
	cur, err := r.coll(collAuditLogs).Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var logs []models.AuditLog
	if err := cur.All(ctx, &logs); err != nil {
		return nil, err
	}
	if logs == nil {
		logs = []models.AuditLog{}
	}
	return &models.PaginatedResult[models.AuditLog]{Items: logs, Total: total, Page: page, Limit: limit}, nil
}

func (r *Repository) AdminResetUserPassword(ctx context.Context, id, newPassword string) error {
	return r.UpdateUserPassword(ctx, id, newPassword)
}

func (r *Repository) UpdateUserPhone(ctx context.Context, id, phone string) error {
	return r.UpdateUser(ctx, id, bson.M{"phone_number": phone})
}

// IsSettingsFlagEnabled returns true when settings doc missing (defaults on).
func (r *Repository) IsSettingsFlagEnabled(ctx context.Context, field string, defaultVal bool) bool {
	s, err := r.GetSettings(ctx)
	if err != nil {
		return defaultVal
	}
	switch field {
	case "login_enabled":
		return s.LoginEnabled
	case "signup_enabled":
		return s.SignupEnabled
	case "payment_enabled":
		return s.PaymentEnabled
	case "otp_enabled":
		return s.OtpEnabled
	default:
		return defaultVal
	}
}

// TouchSettingsDefaults ensures new fields exist on legacy docs.
func (r *Repository) EnsureSettingsDefaults(ctx context.Context) error {
	s, _ := r.GetSettings(ctx)
	update := bson.M{}
	if s.MaxUploadSizeMB == 0 {
		update["max_upload_size_mb"] = 500
	}
	if !s.PaymentEnabled && !s.MaintenanceMode && s.SiteName != "" {
		// only set payment default if doc exists without field - use upsert path
	}
	if len(update) > 0 {
		_, _ = r.UpdateSettings(ctx, update)
	}
	return nil
}

// unused import guard removed
