package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"watch-party/internal/models"
)

func (r *Repository) ListTickets(ctx context.Context, userID string) ([]models.Ticket, error) {
	filter := bson.M{}
	if userID != "" {
		uid, err := parseObjectID(userID)
		if err != nil {
			return nil, err
		}
		filter["user_id"] = uid
	}
	cur, err := r.coll(collTickets).Find(ctx, filter, optionsFindDesc("created_at"))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var tickets []models.Ticket
	if err := cur.All(ctx, &tickets); err != nil {
		return nil, err
	}
	if tickets == nil {
		tickets = []models.Ticket{}
	}
	return tickets, nil
}

func (r *Repository) ListTicketsPaginated(ctx context.Context, status string, page, limit int) (*models.PaginatedResult[models.Ticket], error) {
	page, limit = parsePageLimit(page, limit)
	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}
	total, err := r.coll(collTickets).CountDocuments(ctx, filter)
	if err != nil {
		return nil, err
	}
	skip := int64((page - 1) * limit)
	opts := options.Find().SetSort(bson.D{{Key: "updated_at", Value: -1}}).SetSkip(skip).SetLimit(int64(limit))
	cur, err := r.coll(collTickets).Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var tickets []models.Ticket
	if err := cur.All(ctx, &tickets); err != nil {
		return nil, err
	}
	if tickets == nil {
		tickets = []models.Ticket{}
	}
	return &models.PaginatedResult[models.Ticket]{Items: tickets, Total: total, Page: page, Limit: limit}, nil
}

func (r *Repository) UpdateTicketStatus(ctx context.Context, id, status string) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	_, err = r.coll(collTickets).UpdateByID(ctx, oid, bson.M{"$set": bson.M{
		"status":     status,
		"updated_at": models.NowUTC(),
	}})
	return err
}

func (r *Repository) GetTicket(ctx context.Context, id string) (*models.Ticket, error) {
	oid, err := parseObjectID(id)
	if err != nil {
		return nil, err
	}
	var t models.Ticket
	if err := r.coll(collTickets).FindOne(ctx, bson.M{"_id": oid}).Decode(&t); err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *Repository) CreateTicket(ctx context.Context, t *models.Ticket) error {
	if t.ID.IsZero() {
		t.ID = primitive.NewObjectID()
	}
	now := models.NowUTC()
	t.CreatedAt = now
	t.UpdatedAt = now
	if t.Status == "" {
		t.Status = models.TicketStatusOpen
	}
	_, err := r.coll(collTickets).InsertOne(ctx, t)
	return err
}

func (r *Repository) AddTicketMessage(ctx context.Context, m *models.TicketMessage) error {
	if m.ID.IsZero() {
		m.ID = primitive.NewObjectID()
	}
	m.CreatedAt = models.NowUTC()
	_, err := r.coll(collTicketMsgs).InsertOne(ctx, m)
	if err != nil {
		return err
	}
	_, err = r.coll(collTickets).UpdateByID(ctx, m.TicketID, bson.M{"$set": bson.M{"updated_at": models.NowUTC()}})
	return err
}

func (r *Repository) ListTicketMessages(ctx context.Context, ticketID string) ([]models.TicketMessage, error) {
	tid, err := parseObjectID(ticketID)
	if err != nil {
		return nil, err
	}
	cur, err := r.coll(collTicketMsgs).Find(ctx, bson.M{"ticket_id": tid}, optionsFindAsc("created_at"))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var msgs []models.TicketMessage
	if err := cur.All(ctx, &msgs); err != nil {
		return nil, err
	}
	if msgs == nil {
		msgs = []models.TicketMessage{}
	}
	return msgs, nil
}
