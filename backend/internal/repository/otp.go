package repository

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"watch-party/internal/models"
	"watch-party/internal/phone"
)

const otpTTL = 5 * time.Minute

// SaveOTP stores a one-time code for the given phone (replaces any previous code).
func (r *Repository) SaveOTP(ctx context.Context, phoneNumber, code string) error {
	phoneNumber = phone.Normalize(phoneNumber)
	now := models.NowUTC()
	otp := models.OTP{
		ID:          primitive.NewObjectID(),
		PhoneNumber: phoneNumber,
		Code:        code,
		ExpiresAt:   now.Add(otpTTL),
		CreatedAt:   now,
	}
	_, err := r.coll(collOTPs).DeleteMany(ctx, bson.M{"phone_number": phoneNumber})
	if err != nil {
		return err
	}
	_, err = r.coll(collOTPs).InsertOne(ctx, otp)
	return err
}

// VerifyOTP checks the code for a phone. Returns true when valid; deletes the OTP on success.
func (r *Repository) VerifyOTP(ctx context.Context, phoneNumber, code string) (bool, error) {
	phoneNumber = phone.Normalize(phoneNumber)
	var otp models.OTP
	err := r.coll(collOTPs).FindOne(ctx, bson.M{
		"phone_number": phoneNumber,
		"code":         code,
	}).Decode(&otp)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return false, nil
		}
		return false, err
	}
	if time.Now().UTC().After(otp.ExpiresAt) {
		_, _ = r.coll(collOTPs).DeleteOne(ctx, bson.M{"_id": otp.ID})
		return false, nil
	}
	_, _ = r.coll(collOTPs).DeleteOne(ctx, bson.M{"_id": otp.ID})
	return true, nil
}
