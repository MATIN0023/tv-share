import { authApiRequest } from "./authenticated";
import type { Video } from "./types";

export function listVideos() {
  return authApiRequest<{ videos: Video[] }>("/api/videos");
}

export function uploadVideo(body: { title: string; original_url: string }) {
  return authApiRequest<Video>("/api/videos/upload", {
    method: "POST",
    body,
  });
}

export function deleteVideo(id: string) {
  return authApiRequest<{ message: string }>(`/api/videos/${id}`, {
    method: "DELETE",
  });
}

export function getVideoStatus(id: string) {
  return authApiRequest<{
    id: string;
    process_status: string;
    hls_url?: string;
  }>(`/api/videos/${id}/status`);
}
