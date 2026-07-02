/** Known error context keys for scoped fallbacks */
export type ErrorContextKey =
  | "rooms.load"
  | "rooms.create"
  | "rooms.join"
  | "rooms.detail"
  | "rooms.invite"
  | "rooms.video"
  | "friends.load"
  | "friends.request"
  | "friends.block"
  | "billing.load"
  | "billing.upgrade"
  | "profile.load"
  | "profile.save"
  | "profile.password"
  | "library.load"
  | "library.upload"
  | "library.delete"
  | "tickets.load"
  | "tickets.create"
  | "tickets.reply"
  | "notifications.load"
  | "notifications.read"
  | "dashboard.load"
  | "feed.load"
  | "schedule.load"
  | "history.load"
  | "assistant.chat"
  | "ws.connect"
  | "admin.stats"
  | "admin.users"
  | "admin.users.create"
  | "admin.users.update"
  | "admin.users.delete"
  | "admin.users.ban"
  | "admin.users.subscription"
  | "admin.users.password"
  | "admin.plans"
  | "admin.plans.create"
  | "admin.plans.update"
  | "admin.coupons"
  | "admin.coupons.create"
  | "admin.coupons.update"
  | "admin.coupons.delete"
  | "admin.reports"
  | "admin.reports.resolve"
  | "admin.rooms"
  | "admin.rooms.close"
  | "admin.rooms.delete"
  | "admin.rooms.export"
  | "admin.tickets"
  | "admin.tickets.reply"
  | "admin.tickets.status"
  | "admin.logs"
  | "admin.settings"
  | "admin.maintenance"
  | "admin.videos.delete"
  | "generic";

export type ErrorSeverity = "error" | "warning" | "info";

export type ErrorAction = "retry" | "login" | "support" | "back" | "none";

export interface ParsedError {
  status?: number;
  rawMessage: string;
  isNetwork: boolean;
  isTimeout: boolean;
  isOffline: boolean;
  isAbort: boolean;
}

export interface ResolvedError {
  title: string;
  description: string;
  severity: ErrorSeverity;
  action: ErrorAction;
  code: string;
  /** Original API message when useful for support */
  detail?: string;
  retryable: boolean;
}

export type TranslateFn = (
  key: string,
  params?: Record<string, string | number>
) => string;
