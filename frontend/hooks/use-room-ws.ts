"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import type { WsMessage } from "@/lib/api/types";

type UseRoomWebSocketOptions = {
  roomId: string;
  userId: string;
  enabled?: boolean;
  onMessage?: (msg: WsMessage) => void;
};

function wsBaseUrl(): string {
  return API_BASE_URL.replace(/^http/, "ws");
}

export function useRoomWebSocket({
  roomId,
  userId,
  enabled = true,
  onMessage,
}: UseRoomWebSocketOptions) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const send = useCallback((msg: WsMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const sendChat = useCallback(
    (text: string) => send({ type: "chat", text }),
    [send]
  );

  useEffect(() => {
    if (!enabled || !roomId || !userId) return;

    const url = `${wsBaseUrl()}/ws?user_id=${encodeURIComponent(userId)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", room_id: roomId }));
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WsMessage;
        setLastMessage(msg);
        onMessageRef.current?.(msg);
      } catch {
        /* ignore malformed */
      }
    };

    ws.onerror = () => setError("خطا در اتصال WebSocket");
    ws.onclose = () => setConnected(false);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [enabled, roomId, userId]);

  return { connected, lastMessage, error, send, sendChat };
}
