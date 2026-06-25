import { authApiRequest } from "./authenticated";
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
