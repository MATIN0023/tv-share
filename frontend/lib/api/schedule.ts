import { authApiRequest } from "./authenticated";
import type { ScheduledVideo } from "./types";

export async function listSchedule(status?: string): Promise<ScheduledVideo[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return authApiRequest<ScheduledVideo[]>(`/api/schedule${q}`);
}

export async function createScheduledVideo(payload: {
  room_id: string;
  title: string;
  description?: string;
  video_url: string;
  scheduled_at: string;
}): Promise<ScheduledVideo> {
  return authApiRequest<ScheduledVideo>("/api/schedule", {
    method: "POST",
    body: payload,
  });
}

export async function completeScheduledVideo(id: string): Promise<void> {
  await authApiRequest(`/api/schedule/${id}/complete`, { method: "POST" });
}

export async function deleteScheduledVideo(id: string): Promise<void> {
  await authApiRequest(`/api/schedule/${id}`, { method: "DELETE" });
}
