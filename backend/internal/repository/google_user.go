package repository

import (
	"context"
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"watch-party/internal/models"
)

func (r *Repository) GetUserByGoogleID(ctx context.Context, googleID string) (*models.User, error) {
	var user models.User
	err := r.coll(collUsers).FindOne(ctx, bson.M{"google_id": googleID}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	if email == "" {
		return nil, mongo.ErrNoDocuments
	}
	var user models.User
	err := r.coll(collUsers).FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindOrCreateGoogleUser links or creates a user from Google OAuth profile data.
func (r *Repository) FindOrCreateGoogleUser(ctx context.Context, googleID, email, name, picture string) (*models.User, bool, error) {
	user, err := r.GetUserByGoogleID(ctx, googleID)
	if err == nil {
		return user, false, nil
	}
	if !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, false, err
	}

	if email != "" {
		user, err = r.GetUserByEmail(ctx, email)
		if err == nil {
			_ = r.UpdateUser(ctx, user.ID.Hex(), bson.M{
				"google_id":     googleID,
				"auth_provider": models.AuthProviderBoth,
				"avatar_url":    picture,
			})
			user.GoogleID = googleID
			user.AuthProvider = models.AuthProviderBoth
			if user.AvatarURL == "" {
				user.AvatarURL = picture
			}
			return user, false, nil
		}
		if !errors.Is(err, mongo.ErrNoDocuments) {
			return nil, false, err
		}
	}

	displayName := name
	if displayName == "" && email != "" {
		displayName = email
	}
	if displayName == "" {
		displayName = fmt.Sprintf("user_%s", googleID[:8])
	}

	newUser := &models.User{
		GoogleID:         googleID,
		PhoneNumber:      fmt.Sprintf("google:%s", googleID),
		Email:            email,
		DisplayName:      displayName,
		AvatarURL:        picture,
		AuthProvider:     models.AuthProviderGoogle,
		Role:             models.RoleUser,
		SubscriptionPlan: models.SubscriptionPlanFree,
		IsActive:         true,
	}
	if err := r.CreateUser(ctx, newUser); err != nil {
		return nil, false, err
	}
	return newUser, true, nil
}
