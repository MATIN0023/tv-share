import { authApiRequest } from "./authenticated";
import type { Room, VideoFeed, WatchHistoryEntry } from "./types";

export async function getFeed(): Promise<VideoFeed[]> {
  return authApiRequest<VideoFeed[]>("/api/feed");
}

export async function getWatchHistory(): Promise<WatchHistoryEntry[]> {
  return authApiRequest<WatchHistoryEntry[]>("/api/watch-history");
}

export async function getRoomHistory(): Promise<Room[]> {
  return authApiRequest<Room[]>("/api/room-history");
}
