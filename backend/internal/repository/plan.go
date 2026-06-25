package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"watch-party/internal/models"
)

func (r *Repository) ListPlans(ctx context.Context) ([]models.Plan, error) {
	cur, err := r.coll(collPlans).Find(ctx, bson.M{}, optionsFindAsc("price"))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var plans []models.Plan
	if err := cur.All(ctx, &plans); err != nil {
		return nil, err
	}
	if plans == nil {
		plans = []models.Plan{}
	}
	return plans, nil
}

func (r *Repository) GetPlan(ctx context.Context, id string) (*models.Plan, error) {
	oid, err := parseObjectID(id)
	if err != nil {
		return nil, err
	}
	var plan models.Plan
	if err := r.coll(collPlans).FindOne(ctx, bson.M{"_id": oid}).Decode(&plan); err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *Repository) GetPlanBySlug(ctx context.Context, slug string) (*models.Plan, error) {
	var plan models.Plan
	if err := r.coll(collPlans).FindOne(ctx, bson.M{"slug": slug}).Decode(&plan); err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *Repository) CreatePlan(ctx context.Context, plan *models.Plan) error {
	if plan.ID.IsZero() {
		plan.ID = primitive.NewObjectID()
	}
	now := models.NowUTC()
	plan.CreatedAt = now
	plan.UpdatedAt = now
	_, err := r.coll(collPlans).InsertOne(ctx, plan)
	return err
}

func (r *Repository) UpdatePlan(ctx context.Context, id string, update bson.M) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	update["updated_at"] = models.NowUTC()
	_, err = r.coll(collPlans).UpdateByID(ctx, oid, bson.M{"$set": update})
	return err
}

func (r *Repository) EnsureDefaultPlans(ctx context.Context) error {
	count, _ := r.coll(collPlans).CountDocuments(ctx, bson.M{})
	if count > 0 {
		return nil
	}
	defaults := []models.Plan{
		{Slug: models.SubscriptionPlanFree, Name: "Free", Price: 0, Currency: "IRR", DurationDays: 0, IsActive: true},
		{Slug: models.SubscriptionPlanPremium, Name: "Premium", Price: 99000, Currency: "IRR", DurationDays: 30, IsActive: true, Features: []string{"HD", "No ads", "Priority support"}},
	}
	for i := range defaults {
		if err := r.CreatePlan(ctx, &defaults[i]); err != nil {
			return err
		}
	}
	return nil
}
