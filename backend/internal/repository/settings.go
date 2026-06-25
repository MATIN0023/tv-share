package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"

	"watch-party/internal/models"
)

func (r *Repository) GetSettings(ctx context.Context) (*models.SystemSettings, error) {
	var s models.SystemSettings
	err := r.coll(collSettings).FindOne(ctx, bson.M{"_id": models.SettingsGlobalID}).Decode(&s)
	if err != nil {
		return &models.SystemSettings{
			ID:              models.SettingsGlobalID,
			LoginEnabled:    true,
			SignupEnabled:   true,
			PaymentEnabled:  true,
			OtpEnabled:      true,
			SiteName:        "TV Share",
			SupportEmail:    "support@tvshare.local",
			MaxUploadSizeMB: 500,
			AllowGuestRooms: true,
			UpdatedAt:       models.NowUTC(),
		}, nil
	}
	return &s, nil
}

func (r *Repository) UpdateSettings(ctx context.Context, update bson.M) (*models.SystemSettings, error) {
	update["_id"] = models.SettingsGlobalID
	update["updated_at"] = models.NowUTC()
	opts := options.Update().SetUpsert(true)
	_, err := r.coll(collSettings).UpdateOne(ctx, bson.M{"_id": models.SettingsGlobalID}, bson.M{"$set": update}, opts)
	if err != nil {
		return nil, err
	}
	return r.GetSettings(ctx)
}
