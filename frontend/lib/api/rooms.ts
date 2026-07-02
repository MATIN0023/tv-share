import { authApiRequest } from "./authenticated";
import { API_BASE_URL } from "./client";
import { getAuthToken } from "./session";
import { ApiError } from "./client";
import type { Room, RoomMessage } from "./types";

export async function listRooms(): Promise<Room[]> {
  return authApiRequest<Room[]>("/api/rooms");
}

export async function createRoom(payload: {
  name: string;
  visibility?: string;
  background?: string;
}): Promise<Room> {
  return authApiRequest<Room>("/api/rooms", {
    method: "POST",
    body: payload,
  });
}

export async function searchRooms(q: string): Promise<Room[]> {
  return authApiRequest<Room[]>(`/api/rooms/search?q=${encodeURIComponent(q)}`);
}

export async function getRoom(id: string): Promise<Room> {
  return authApiRequest<Room>(`/api/rooms/${id}`);
}

export async function updateRoomVideo(
  id: string,
  videoUrl: string
): Promise<{ video_url: string }> {
  return authApiRequest(`/api/rooms/${id}/video`, {
    method: "PUT",
    body: { video_url: videoUrl },
  });
}

export async function createInvitation(id: string): Promise<{
  code: string;
  expires: string;
  room_id: string;
}> {
  return authApiRequest(`/api/rooms/${id}/invitations`, { method: "POST" });
}

export async function acceptInvitation(code: string): Promise<{ room_id: string }> {
  return authApiRequest("/api/invitations/accept", {
    method: "POST",
    body: { code },
  });
}

export async function getRoomMessages(id: string): Promise<RoomMessage[]> {
  return authApiRequest<RoomMessage[]>(`/api/rooms/${id}/messages`);
}

export async function playRoom(id: string): Promise<Room> {
  return authApiRequest<Room>(`/api/rooms/${id}/playback/play`, { method: "POST" });
}

export async function pauseRoom(id: string): Promise<Room> {
  return authApiRequest<Room>(`/api/rooms/${id}/playback/pause`, { method: "POST" });
}

export async function seekRoom(id: string, currentTime: number): Promise<Room> {
  return authApiRequest<Room>(`/api/rooms/${id}/playback/seek`, {
    method: "POST",
    body: { current_time: currentTime },
  });
}

export async function exportRoomChat(
  id: string,
  format: "txt" | "csv" = "txt",
  zip = false
): Promise<Blob> {
  const token = getAuthToken();
  const params = new URLSearchParams({ format });
  if (zip) params.set("zip", "1");
  const res = await fetch(
    `${API_BASE_URL}/api/rooms/${id}/export-chat?${params.toString()}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  if (!res.ok) {
    const text = await res.text();
    let message = res.statusText;
    try {
      const data = JSON.parse(text);
      if (data?.error) message = String(data.error);
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }
  return res.blob();
}
