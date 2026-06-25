package repository

import (
	"context"
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"watch-party/internal/models"
)

func (r *Repository) ListDiscountCodes(ctx context.Context) ([]models.DiscountCode, error) {
	cur, err := r.coll(collDiscounts).Find(ctx, bson.M{}, optionsFindDesc("created_at"))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var codes []models.DiscountCode
	if err := cur.All(ctx, &codes); err != nil {
		return nil, err
	}
	if codes == nil {
		codes = []models.DiscountCode{}
	}
	return codes, nil
}

func (r *Repository) GetDiscountByID(ctx context.Context, id string) (*models.DiscountCode, error) {
	oid, err := parseObjectID(id)
	if err != nil {
		return nil, err
	}
	var d models.DiscountCode
	if err := r.coll(collDiscounts).FindOne(ctx, bson.M{"_id": oid}).Decode(&d); err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *Repository) CreateDiscountCode(ctx context.Context, d *models.DiscountCode) error {
	if d.ID.IsZero() {
		d.ID = primitive.NewObjectID()
	}
	d.Code = strings.ToUpper(strings.TrimSpace(d.Code))
	now := models.NowUTC()
	d.CreatedAt = now
	d.UpdatedAt = now
	if d.DiscountType == "" {
		d.DiscountType = models.DiscountTypePercent
	}
	_, err := r.coll(collDiscounts).InsertOne(ctx, d)
	return err
}

func (r *Repository) UpdateDiscountCode(ctx context.Context, id string, update bson.M) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	if code, ok := update["code"].(string); ok {
		update["code"] = strings.ToUpper(strings.TrimSpace(code))
	}
	update["updated_at"] = models.NowUTC()
	_, err = r.coll(collDiscounts).UpdateByID(ctx, oid, bson.M{"$set": update})
	return err
}

func (r *Repository) DeleteDiscountCode(ctx context.Context, id string) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	_, err = r.coll(collDiscounts).DeleteOne(ctx, bson.M{"_id": oid})
	return err
}

type DiscountValidation struct {
	Code           string  `json:"code"`
	DiscountType   string  `json:"discount_type"`
	DiscountPercent float64 `json:"discount_percent,omitempty"`
	DiscountAmount  float64 `json:"discount_amount,omitempty"`
	FinalAmount    float64 `json:"final_amount"`
	OriginalAmount float64 `json:"original_amount"`
}

func (r *Repository) ValidateDiscountCode(ctx context.Context, code, planSlug string, originalAmount float64) (*DiscountValidation, error) {
	code = strings.ToUpper(strings.TrimSpace(code))
	var d models.DiscountCode
	err := r.coll(collDiscounts).FindOne(ctx, bson.M{"code": code}).Decode(&d)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("کد تخفیف نامعتبر است")
		}
		return nil, err
	}
	now := models.NowUTC()
	if !d.IsActive {
		return nil, errors.New("کد تخفیف غیرفعال است")
	}
	if !d.ValidFrom.IsZero() && now.Before(d.ValidFrom) {
		return nil, errors.New("کد تخفیف هنوز فعال نشده")
	}
	if !d.ValidUntil.IsZero() && now.After(d.ValidUntil) {
		return nil, errors.New("کد تخفیف منقضی شده")
	}
	if d.MaxUses > 0 && d.UsedCount >= d.MaxUses {
		return nil, errors.New("ظرفیت استفاده از کد تکمیل شده")
	}
	if len(d.PlanSlugs) > 0 && planSlug != "" {
		ok := false
		for _, s := range d.PlanSlugs {
			if s == planSlug {
				ok = true
				break
			}
		}
		if !ok {
			return nil, errors.New("کد برای این پلن قابل استفاده نیست")
		}
	}

	final := originalAmount
	switch d.DiscountType {
	case models.DiscountTypeFixed:
		final = originalAmount - d.DiscountAmount
	case models.DiscountTypePercent:
		final = originalAmount * (1 - d.DiscountPercent/100)
	}
	if final < 0 {
		final = 0
	}

	return &DiscountValidation{
		Code:            d.Code,
		DiscountType:    d.DiscountType,
		DiscountPercent: d.DiscountPercent,
		DiscountAmount:  d.DiscountAmount,
		FinalAmount:     final,
		OriginalAmount:  originalAmount,
	}, nil
}

func (r *Repository) RedeemDiscountCode(ctx context.Context, code string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	_, err := r.coll(collDiscounts).UpdateOne(ctx,
		bson.M{"code": code},
		bson.M{"$inc": bson.M{"used_count": 1}, "$set": bson.M{"updated_at": models.NowUTC()}},
	)
	return err
}
