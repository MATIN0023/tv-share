import { authApiRequest } from "./authenticated";
import type { Friend, FriendRequest } from "./types";

export async function listFriends(): Promise<{ friends: Friend[] }> {
  return authApiRequest("/api/friends");
}

export async function listFriendRequests(): Promise<{ pending: FriendRequest[] }> {
  return authApiRequest("/api/friends/requests");
}

export async function sendFriendRequest(toUserId: string): Promise<void> {
  await authApiRequest("/api/friends/requests", {
    method: "POST",
    body: { to_user_id: toUserId },
  });
}

export async function acceptFriendRequest(fromUserId: string): Promise<void> {
  await authApiRequest("/api/friends/requests/accept", {
    method: "PUT",
    body: { from_user_id: fromUserId },
  });
}

export async function rejectFriendRequest(fromUserId: string): Promise<void> {
  await authApiRequest("/api/friends/requests/reject", {
    method: "PUT",
    body: { from_user_id: fromUserId },
  });
}
