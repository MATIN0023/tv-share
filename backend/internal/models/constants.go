package models

// User roles.
const (
	RoleUser       = "user"
	RoleAdmin      = "admin"
	RoleSuperAdmin = "superadmin"
)

// Subscription plan slugs.
const (
	SubscriptionPlanFree    = "free"
	SubscriptionPlanPremium   = "premium"
)

// Room status.
const (
	RoomStatusActive   = "active"
	RoomStatusInactive = "inactive"
)

// Video processing status.
const (
	VideoProcessStatusPending    = "pending"
	VideoProcessStatusProcessing = "processing"
	VideoProcessStatusReady      = "ready"
	VideoProcessStatusFailed     = "failed"
)

// Transaction status.
const (
	TransactionStatusPending   = "pending"
	TransactionStatusCompleted = "completed"
	TransactionStatusFailed    = "failed"
)

// Report status.
const (
	ReportStatusOpen     = "open"
	ReportStatusResolved = "resolved"
)

// Ticket status.
const (
	TicketStatusOpen       = "open"
	TicketStatusInProgress = "in_progress"
	TicketStatusClosed     = "closed"
)

// Notification types.
const (
	NotificationTypeInfo    = "info"
	NotificationTypeBilling = "billing"
	NotificationTypeSystem  = "system"
)

const SettingsGlobalID = "global"
