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

type DailyCount struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

type AdminFunnel struct {
	TotalUsers     int64 `json:"total_users"`
	UsersWithRoom  int64 `json:"users_with_room"`
	UsersWithVideo int64 `json:"users_with_video"`
	UsersWithFriend int64 `json:"users_with_friend"`
	PaidUsers      int64 `json:"paid_users"`
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

	// Growth & engagement
	NewUsersToday  int64 `json:"new_users_today"`
	NewUsers7d     int64 `json:"new_users_7d"`
	NewUsers30d    int64 `json:"new_users_30d"`
	ActiveUsers7d  int64 `json:"active_users_7d"`
	ActiveUsers30d int64 `json:"active_users_30d"`
	LoginsToday    int64 `json:"logins_today"`

	// Plans & auth
	FreeUsers       int64 `json:"free_users"`
	GoogleAuthUsers int64 `json:"google_auth_users"`

	// Revenue
	TotalRevenue      float64 `json:"total_revenue"`
	Revenue30d        float64 `json:"revenue_30d"`
	CompletedPayments int64   `json:"completed_payments"`
	FailedPayments    int64   `json:"failed_payments"`

	// Social & support
	PendingFriendRequests int64 `json:"pending_friend_requests"`
	TotalFriendships      int64 `json:"total_friendships"`
	RoomsCreated7d        int64 `json:"rooms_created_7d"`
	VideosUploaded7d      int64 `json:"videos_uploaded_7d"`

	SignupTrend []DailyCount `json:"signup_trend"`
	Funnel      AdminFunnel  `json:"funnel"`
}
