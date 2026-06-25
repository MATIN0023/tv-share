package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"watch-party/internal/models"
)

func (r *Repository) CreateTransaction(ctx context.Context, userID string, amount float64, planSlug, gatewayRef, discountCode string, discountAmount float64) (*models.Transaction, error) {
	userOID, err := parseObjectID(userID)
	if err != nil {
		return nil, err
	}
	now := models.NowUTC()
	tx := models.Transaction{
		ID:               primitive.NewObjectID(),
		UserID:           userOID,
		Amount:           amount,
		PlanSlug:         planSlug,
		DiscountCode:     discountCode,
		DiscountAmount:   discountAmount,
		Status:           models.TransactionStatusPending,
		GatewayReference: gatewayRef,
		CreatedAt:        now,
		UpdatedAt:        now,
	}
	_, err = r.coll(collTransactions).InsertOne(ctx, tx)
	if err != nil {
		return nil, err
	}
	return &tx, nil
}

func (r *Repository) UpdateTransactionStatus(ctx context.Context, id, status string) error {
	oid, err := parseObjectID(id)
	if err != nil {
		return err
	}
	_, err = r.coll(collTransactions).UpdateByID(ctx, oid, bson.M{"$set": bson.M{
		"status":     status,
		"updated_at": models.NowUTC(),
	}})
	return err
}

func (r *Repository) ListAllTransactions(ctx context.Context) ([]models.Transaction, error) {
	cur, err := r.coll(collTransactions).Find(ctx, bson.M{}, optionsFindDesc("created_at"))
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
	return txs, nil
}

func (r *Repository) ListTransactionsByUser(ctx context.Context, userID string) ([]models.Transaction, error) {
	userOID, err := parseObjectID(userID)
	if err != nil {
		return nil, err
	}
	cur, err := r.coll(collTransactions).Find(ctx, bson.M{"user_id": userOID}, optionsFindDesc("created_at"))
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
	return txs, nil
}

func (r *Repository) GetTransactionByGatewayRef(ctx context.Context, ref string) (*models.Transaction, error) {
	var tx models.Transaction
	if err := r.coll(collTransactions).FindOne(ctx, bson.M{"gateway_reference": ref}).Decode(&tx); err != nil {
		return nil, err
	}
	return &tx, nil
}

func (r *Repository) CompleteTransaction(ctx context.Context, gatewayRef string) (*models.Transaction, error) {
	tx, err := r.GetTransactionByGatewayRef(ctx, gatewayRef)
	if err != nil {
		return nil, err
	}
	if tx.Status == models.TransactionStatusCompleted {
		return tx, nil
	}
	if err := r.UpdateTransactionStatus(ctx, tx.ID.Hex(), models.TransactionStatusCompleted); err != nil {
		return nil, err
	}
	if tx.PlanSlug != "" && tx.PlanSlug != models.SubscriptionPlanFree {
		plan, err := r.GetPlanBySlug(ctx, tx.PlanSlug)
		if err != nil {
			return nil, err
		}
		expires := models.NowUTC().AddDate(0, 0, plan.DurationDays)
		if err := r.SetUserSubscription(ctx, tx.UserID.Hex(), tx.PlanSlug, expires); err != nil {
			return nil, err
		}
	}
	if tx.DiscountCode != "" {
		_ = r.RedeemDiscountCode(ctx, tx.DiscountCode)
	}
	tx.Status = models.TransactionStatusCompleted
	return tx, nil
}
