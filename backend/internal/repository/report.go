package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"watch-party/internal/models"
)

func (r *Repository) ListReports(ctx context.Context, status string) ([]models.Report, error) {
	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}
	cur, err := r.coll(collReports).Find(ctx, filter, optionsFindDesc("created_at"))
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
	return reports, nil
}

func (r *Repository) ResolveReport(ctx context.Context, id, resolverID string) error {
	rid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	resolver, err := parseObjectID(resolverID)
	if err != nil {
		return err
	}
	now := models.NowUTC()
	_, err = r.coll(collReports).UpdateByID(ctx, rid, bson.M{"$set": bson.M{
		"status":      models.ReportStatusResolved,
		"resolved_by": resolver,
		"resolved_at": now,
		"updated_at":  now,
	}})
	return err
}

func (r *Repository) CreateReport(ctx context.Context, report *models.Report) error {
	if report.ID.IsZero() {
		report.ID = primitive.NewObjectID()
	}
	now := models.NowUTC()
	report.CreatedAt = now
	report.UpdatedAt = now
	if report.Status == "" {
		report.Status = models.ReportStatusOpen
	}
	_, err := r.coll(collReports).InsertOne(ctx, report)
	return err
}
