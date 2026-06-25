package models

import "time"

type SystemSettings struct {
	ID               string `bson:"_id" json:"id"`
	MaintenanceMode  bool   `bson:"maintenance_mode" json:"maintenance_mode"`
	LoginEnabled     bool   `bson:"login_enabled" json:"login_enabled"`
	SignupEnabled    bool   `bson:"signup_enabled" json:"signup_enabled"`
	PaymentEnabled   bool   `bson:"payment_enabled" json:"payment_enabled"`
	OtpEnabled       bool   `bson:"otp_enabled" json:"otp_enabled"`
	SiteName         string `bson:"site_name" json:"site_name"`
	SupportEmail     string `bson:"support_email" json:"support_email"`
	SupportPhone     string `bson:"support_phone,omitempty" json:"support_phone,omitempty"`
	AnnouncementText string `bson:"announcement_text,omitempty" json:"announcement_text,omitempty"`
	MaxUploadSizeMB  int    `bson:"max_upload_size_mb" json:"max_upload_size_mb"`
	AllowGuestRooms  bool   `bson:"allow_guest_rooms" json:"allow_guest_rooms"`
	UpdatedAt        time.Time `bson:"updated_at" json:"updated_at"`
}

type AdminStats struct {
	TotalUsers        int64 `json:"total_users"`
	ActiveUsers       int64 `json:"active_users"`
	BannedUsers       int64 `json:"banned_users"`
	TotalRooms        int64 `json:"total_rooms"`
	LiveRooms         int64 `json:"live_rooms"`
	TotalVideos       int64 `json:"total_videos"`
	TotalTransactions int64 `json:"total_transactions"`
	OpenReports       int64 `json:"open_reports"`
	OpenTickets       int64 `json:"open_tickets"`
	PremiumUsers      int64 `json:"premium_users"`
}
