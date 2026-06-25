package repository

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"watch-party/internal/models"
)

func (r *Repository) SendFriendRequest(ctx context.Context, fromUserID, toUserID string) error {
	fromOID, err := parseObjectID(fromUserID)
	if err != nil {
		return err
	}
	toOID, err := parseObjectID(toUserID)
	if err != nil {
		return err
	}

	count, err := r.coll(collFriendships).CountDocuments(ctx, bson.M{
		"$or": []bson.M{
			{"from_user_id": fromOID, "to_user_id": toOID},
			{"from_user_id": toOID, "to_user_id": fromOID},
		},
	})
	if err != nil {
		return err
	}
	if count > 0 {
		return mongo.ErrNoDocuments
	}

	now := models.NowUTC()
	f := models.Friendship{
		ID:         primitive.NewObjectID(),
		FromUserID: fromOID,
		ToUserID:   toOID,
		Status:     models.FriendshipStatusPending,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	_, err = r.coll(collFriendships).InsertOne(ctx, f)
	return err
}

func (r *Repository) AcceptFriendRequest(ctx context.Context, fromUserID, toUserID string) error {
	fromOID, err := parseObjectID(fromUserID)
	if err != nil {
		return err
	}
	toOID, err := parseObjectID(toUserID)
	if err != nil {
		return err
	}
	res, err := r.coll(collFriendships).UpdateOne(ctx,
		bson.M{"from_user_id": fromOID, "to_user_id": toOID, "status": models.FriendshipStatusPending},
		bson.M{"$set": bson.M{"status": models.FriendshipStatusAccepted, "updated_at": models.NowUTC()}},
	)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("friend request not found")
	}
	_ = r.AddFriend(ctx, toUserID, fromUserID)
	_ = r.AddFriend(ctx, fromUserID, toUserID)
	return nil
}

func (r *Repository) RejectFriendRequest(ctx context.Context, fromUserID, toUserID string) error {
	fromOID, err := parseObjectID(fromUserID)
	if err != nil {
		return err
	}
	toOID, err := parseObjectID(toUserID)
	if err != nil {
		return err
	}
	_, err = r.coll(collFriendships).DeleteOne(ctx, bson.M{
		"from_user_id": fromOID,
		"to_user_id":   toOID,
		"status":       models.FriendshipStatusPending,
	})
	return err
}

func (r *Repository) GetFriends(ctx context.Context, userID string) ([]models.Friend, error) {
	uid, err := parseObjectID(userID)
	if err != nil {
		return nil, err
	}
	pipeline := []bson.M{
		{"$match": bson.M{
			"status": models.FriendshipStatusAccepted,
			"$or": []bson.M{
				{"from_user_id": uid},
				{"to_user_id": uid},
			},
		}},
		{"$addFields": bson.M{
			"friend_id": bson.M{
				"$cond": bson.A{
					bson.M{"$eq": []interface{}{"$from_user_id", uid}},
					"$to_user_id",
					"$from_user_id",
				},
			},
		}},
		{"$lookup": bson.M{
			"from":         collUsers,
			"localField":   "friend_id",
			"foreignField": "_id",
			"as":           "friend",
		}},
		{"$unwind": "$friend"},
		{"$project": bson.M{
			"_id":            1,
			"friend_id":      1,
			"friend_name":    "$friend.display_name",
			"friend_avatar":  "$friend.avatar_url",
			"added_at":       "$updated_at",
		}},
	}
	cur, err := r.coll(collFriendships).Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var friends []models.Friend
	if err := cur.All(ctx, &friends); err != nil {
		return nil, err
	}
	if friends == nil {
		friends = []models.Friend{}
	}
	return friends, nil
}

func (r *Repository) GetPendingRequests(ctx context.Context, userID string) ([]models.FriendRequest, error) {
	uid, err := parseObjectID(userID)
	if err != nil {
		return nil, err
	}
	cur, err := r.coll(collFriendships).Find(ctx, bson.M{
		"to_user_id": uid,
		"status":     models.FriendshipStatusPending,
	}, optionsFindDesc("created_at"))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var reqs []models.FriendRequest
	if err := cur.All(ctx, &reqs); err != nil {
		return nil, err
	}
	if reqs == nil {
		reqs = []models.FriendRequest{}
	}
	return reqs, nil
}
