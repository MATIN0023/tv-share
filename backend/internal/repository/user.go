package repository

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"

	"watch-party/internal/models"
	"watch-party/internal/phone"
)

func (r *Repository) ListUsers(ctx context.Context) ([]models.User, error) {
	return r.listUsersFilter(ctx, bson.M{"is_active": true})
}

func (r *Repository) ListAllUsers(ctx context.Context) ([]models.User, error) {
	return r.listUsersFilter(ctx, bson.M{})
}

func (r *Repository) listUsersFilter(ctx context.Context, filter bson.M) ([]models.User, error) {
	cur, err := r.coll(collUsers).Find(ctx, filter, optionsFindDesc("created_at"))
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
	return users, nil
}

func (r *Repository) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func (r *Repository) CheckPassword(password, hash string) bool {
	if hash == "" {
		return false
	}
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func (r *Repository) CreateUser(ctx context.Context, user *models.User) error {
	if user.ID.IsZero() {
		user.ID = primitive.NewObjectID()
	}
	now := models.NowUTC()
	if user.CreatedAt.IsZero() {
		user.CreatedAt = now
	}
	user.UpdatedAt = now
	if user.Role == "" {
		user.Role = models.RoleUser
	}
	if user.SubscriptionPlan == "" {
		user.SubscriptionPlan = models.SubscriptionPlanFree
	}
	user.IsActive = true
	if user.PhoneNumber != "" {
		user.PhoneNumber = phone.Normalize(user.PhoneNumber)
	}
	_, err := r.coll(collUsers).InsertOne(ctx, user)
	return err
}

func (r *Repository) CreateUserWithPassword(ctx context.Context, phoneNumber, password, displayName string) (*models.User, error) {
	hash, err := r.HashPassword(password)
	if err != nil {
		return nil, err
	}
	user := &models.User{
		PhoneNumber:      phone.Normalize(phoneNumber),
		PasswordHash:     hash,
		DisplayName:      displayName,
		Role:             models.RoleUser,
		SubscriptionPlan: models.SubscriptionPlanFree,
		IsActive:         true,
	}
	if err := r.CreateUser(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (r *Repository) GetUserByPhone(ctx context.Context, phoneNumber string) (*models.User, error) {
	phoneNumber = phone.Normalize(phoneNumber)
	var user models.User
	err := r.coll(collUsers).FindOne(ctx, bson.M{"phone_number": phoneNumber}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	oid, err := parseObjectID(id)
	if err != nil {
		return nil, err
	}
	var user models.User
	err = r.coll(collUsers).FindOne(ctx, bson.M{"_id": oid}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) UpdateUser(ctx context.Context, id string, update bson.M) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	update["updated_at"] = models.NowUTC()
	_, err = r.coll(collUsers).UpdateByID(ctx, oid, bson.M{"$set": update})
	return err
}

func (r *Repository) UpdateUserProfile(ctx context.Context, id, displayName, avatarURL, email, familyName, birthday, gender, phoneNum, country, city, bio string) error {
	update := bson.M{
		"display_name": displayName,
		"avatar_url":   avatarURL,
		"email":        email,
		"family_name":  familyName,
		"gender":       gender,
		"phone":        phoneNum,
		"country":      country,
		"city":         city,
		"bio":          bio,
	}
	if birthday != "" {
		if t, err := time.Parse("2006-01-02", birthday); err == nil {
			update["birthday"] = t.UTC()
		}
	}
	return r.UpdateUser(ctx, id, update)
}

func (r *Repository) UpdateUserPassword(ctx context.Context, id, newPassword string) error {
	hash, err := r.HashPassword(newPassword)
	if err != nil {
		return err
	}
	return r.UpdateUser(ctx, id, bson.M{"password_hash": hash})
}

func (r *Repository) UpdateUserAvatar(ctx context.Context, id, avatarURL string) error {
	return r.UpdateUser(ctx, id, bson.M{"avatar_url": avatarURL})
}

func (r *Repository) SetUserActive(ctx context.Context, id string, active bool) error {
	return r.UpdateUser(ctx, id, bson.M{"is_active": active})
}

func (r *Repository) SetUserSubscription(ctx context.Context, id, planSlug string, expiresAt time.Time) error {
	return r.UpdateUser(ctx, id, bson.M{
		"subscription_plan":       planSlug,
		"subscription_expires_at": expiresAt.UTC(),
	})
}

func (r *Repository) DeleteUser(ctx context.Context, id string) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	_, err = r.coll(collUsers).DeleteOne(ctx, bson.M{"_id": oid})
	return err
}

func (r *Repository) TouchLastLogin(ctx context.Context, id string) error {
	now := models.NowUTC()
	return r.UpdateUser(ctx, id, bson.M{"last_login_at": now})
}

// InvalidateUserSessions bumps token_version so all existing JWTs for this user are rejected.
func (r *Repository) InvalidateUserSessions(ctx context.Context, userID string) error {
	oid, err := parseObjectID(userID)
	if err != nil {
		return err
	}
	_, err = r.coll(collUsers).UpdateByID(ctx, oid, bson.M{
		"$inc": bson.M{"token_version": 1},
		"$set": bson.M{"updated_at": models.NowUTC()},
	})
	return err
}

func (r *Repository) BlockUser(ctx context.Context, userID, blockedID string) error {
	uid, err := parseObjectID(userID)
	if err != nil {
		return err
	}
	bid, err := parseObjectID(blockedID)
	if err != nil {
		return err
	}
	_, err = r.coll(collUsers).UpdateByID(ctx, uid, bson.M{
		"$addToSet": bson.M{"blocked_users": bid},
		"$set":      bson.M{"updated_at": models.NowUTC()},
	})
	return err
}

func (r *Repository) ListBlockedUsers(ctx context.Context, userID string) ([]models.User, error) {
	user, err := r.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if len(user.BlockedUsers) == 0 {
		return []models.User{}, nil
	}
	cur, err := r.coll(collUsers).Find(ctx, bson.M{"_id": bson.M{"$in": user.BlockedUsers}})
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
	return users, nil
}

func (r *Repository) EnsureDefaultUser(ctx context.Context, adminPhone, adminPassword, testPhone, testPassword string) error {
	if err := r.MigrateRemoveUsername(ctx); err != nil {
		return err
	}
	if adminPhone == "" || adminPassword == "" {
		return nil
	}

	if _, err := r.GetUserByPhone(ctx, adminPhone); err == nil {
		return r.ensureTestUser(ctx, testPhone, testPassword)
	} else if !errors.Is(err, mongo.ErrNoDocuments) {
		return err
	}

	user, err := r.CreateUserWithPassword(ctx, adminPhone, adminPassword, "Admin User")
	if err != nil {
		return err
	}
	if err := r.UpdateUser(ctx, user.ID.Hex(), bson.M{"role": models.RoleAdmin}); err != nil {
		return err
	}
	return r.ensureTestUser(ctx, testPhone, testPassword)
}

func (r *Repository) ensureTestUser(ctx context.Context, testPhone, testPassword string) error {
	if testPhone == "" || testPassword == "" {
		return nil
	}

	if _, err := r.GetUserByPhone(ctx, testPhone); err == nil {
		return nil
	} else if !errors.Is(err, mongo.ErrNoDocuments) {
		return err
	}

	_, err := r.CreateUserWithPassword(ctx, testPhone, testPassword, "Test User")
	return err
}

// MigrateRemoveUsername strips legacy username field from all user documents.
func (r *Repository) MigrateRemoveUsername(ctx context.Context) error {
	_, err := r.coll(collUsers).UpdateMany(ctx, bson.M{}, bson.M{"$unset": bson.M{"username": ""}})
	return err
}

func (r *Repository) AddFriend(ctx context.Context, userID, friendID string) error {
	uid, err := parseObjectID(userID)
	if err != nil {
		return err
	}
	fid, err := parseObjectID(friendID)
	if err != nil {
		return err
	}
	_, err = r.coll(collUsers).UpdateByID(ctx, uid, bson.M{
		"$addToSet": bson.M{"friends": fid},
		"$set":      bson.M{"updated_at": models.NowUTC()},
	})
	return err
}

func (r *Repository) CountUsers(ctx context.Context, filter bson.M) (int64, error) {
	return r.coll(collUsers).CountDocuments(ctx, filter)
}
