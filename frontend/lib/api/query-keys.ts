export const queryKeys = {
  me: ["me"] as const,
  rooms: {
    all: ["rooms"] as const,
    list: () => [...queryKeys.rooms.all, "list"] as const,
    detail: (id: string) => [...queryKeys.rooms.all, id] as const,
    messages: (id: string) => [...queryKeys.rooms.all, id, "messages"] as const,
  },
  friends: {
    all: ["friends"] as const,
    list: () => [...queryKeys.friends.all, "list"] as const,
    requests: () => [...queryKeys.friends.all, "requests"] as const,
    blocked: () => [...queryKeys.friends.all, "blocked"] as const,
  },
  feed: ["feed"] as const,
  watchHistory: ["watch-history"] as const,
  roomHistory: ["room-history"] as const,
  schedule: ["schedule"] as const,
  users: ["users"] as const,
  videos: {
    all: ["videos"] as const,
    list: () => [...queryKeys.videos.all, "list"] as const,
  },
  billing: {
    all: ["billing"] as const,
    subscription: () => [...queryKeys.billing.all, "subscription"] as const,
    transactions: () => [...queryKeys.billing.all, "transactions"] as const,
    plans: () => [...queryKeys.billing.all, "plans"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => [...queryKeys.notifications.all, "list"] as const,
  },
  tickets: {
    all: ["tickets"] as const,
    list: () => [...queryKeys.tickets.all, "list"] as const,
    detail: (id: string) => [...queryKeys.tickets.all, id] as const,
  },
  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    users: () => [...queryKeys.admin.all, "users"] as const,
    plans: () => [...queryKeys.admin.all, "plans"] as const,
    transactions: () => [...queryKeys.admin.all, "transactions"] as const,
    reports: (status?: string) =>
      [...queryKeys.admin.all, "reports", status ?? "all"] as const,
    liveRooms: () => [...queryKeys.admin.all, "live-rooms"] as const,
    settings: () => [...queryKeys.admin.all, "settings"] as const,
    discounts: () => [...queryKeys.admin.all, "discounts"] as const,
    logs: () => [...queryKeys.admin.all, "logs"] as const,
    rooms: (params?: string) =>
      [...queryKeys.admin.all, "rooms", params ?? "all"] as const,
    usersList: (params?: string) =>
      [...queryKeys.admin.all, "users", params ?? "all"] as const,
  },
} as const;
