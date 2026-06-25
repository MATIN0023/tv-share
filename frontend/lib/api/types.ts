export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type DiscountCode = {
  id: string;
  code: string;
  description?: string;
  discount_type: "percent" | "fixed";
  discount_percent?: number;
  discount_amount?: number;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  plan_slugs?: string[];
  is_active: boolean;
  created_at: string;
};

export type AuditLog = {
  id: string;
  actor_id: string;
  actor_phone?: string;
  actor_name?: string;
  actor_role?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: string;
  created_at: string;
};

export type AdminRoom = {
  id: string;
  name: string;
  owner_id: string;
  slug: string;
  status: string;
  visibility: string;
  is_playing: boolean;
  video_id?: string;
  video_path?: string;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  token: string;
  user_id: string;
  phone_number: string;
  display_name?: string;
  avatar?: string;
  role: string;
  is_new_user?: boolean;
};

export type RegisterPayload = {
  phone_number: string;
  password: string;
  display_name?: string;
};

export type LoginPayload = {
  phone_number: string;
  password: string;
};

export type OTPRequestPayload = {
  phone_number: string;
};

export type OTPVerifyPayload = {
  phone_number: string;
  code: string;
};

export type UserProfile = {
  id: string;
  phone_number: string;
  display_name?: string;
  avatar_url?: string;
  role: string;
  email?: string;
  bio?: string;
  subscription_plan?: string;
  subscription_expires_at?: string;
  is_active?: boolean;
  created_at: string;
};

export type AdminStats = {
  total_users: number;
  active_users: number;
  banned_users: number;
  total_rooms: number;
  live_rooms: number;
  total_videos: number;
  total_transactions: number;
  open_reports: number;
  open_tickets: number;
  premium_users: number;
};

export type Plan = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration_days: number;
  features?: string[];
  is_active: boolean;
};

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  plan_slug?: string;
  discount_code?: string;
  discount_amount?: number;
  status: string;
  gateway_reference: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  priority?: string;
  created_at: string;
  updated_at: string;
};

export type TicketMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  body: string;
  is_staff: boolean;
  created_at: string;
};

export type Video = {
  id: string;
  uploader_id: string;
  title: string;
  original_url: string;
  hls_url?: string;
  process_status: string;
  created_at: string;
};

export type SystemSettings = {
  id: string;
  maintenance_mode: boolean;
  login_enabled: boolean;
  signup_enabled: boolean;
  payment_enabled: boolean;
  otp_enabled: boolean;
  site_name: string;
  support_email: string;
  support_phone?: string;
  announcement_text?: string;
  max_upload_size_mb: number;
  allow_guest_rooms: boolean;
  updated_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  created_at: string;
};

export type Room = {
  id: string;
  name: string;
  owner_id: string;
  visibility: string;
  status?: string;
  is_playing?: boolean;
  video_path?: string;
  created_at: string;
};

export type Friend = {
  id: string;
  friend_id: string;
  friend_name: string;
  friend_avatar?: string;
  added_at: string;
};

export type FriendRequest = {
  id?: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  created_at: string;
};

export type VideoFeed = {
  room_id: string;
  room_name: string;
  video_path?: string;
  owner_id: string;
  owner_name: string;
  owner_avatar?: string;
  created_at: string;
};

export type WatchHistoryEntry = {
  id: string;
  user_id: string;
  video_id?: string;
  room_id?: string;
  room_name?: string;
  video_path?: string;
  watched_at: string;
  last_position: number;
  duration: number;
};

export type ScheduledVideo = {
  id: string;
  room_id: string;
  title: string;
  description?: string;
  video_url: string;
  scheduled_for: string;
  created_by: string;
  is_played: boolean;
  created_at: string;
  updated_at: string;
};

export type RoomMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
};

export type WsMessage = {
  type: string;
  text?: string;
  from?: string;
  from_id?: string;
  time?: string;
  room_id?: string;
  video?: string;
  is_playing?: boolean;
  current_time?: number;
  duration?: number;
};
