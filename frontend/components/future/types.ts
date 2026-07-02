export type FuturePlaylistItem = {
  id: string;
  title: string;
  duration: string;
  thumbnail?: string;
  status?: "ready" | "processing" | "error";
};

export type FutureRoomMember = {
  id: string;
  name: string;
  avatar?: string;
  role: "owner" | "cohost" | "member";
  isOnline: boolean;
  isMuted?: boolean;
  isSpeaking?: boolean;
};

export type VoiceChatParticipant = {
  id: string;
  name: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isDeafened?: boolean;
  level?: number;
};
