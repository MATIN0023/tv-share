"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { getAuthToken } from "@/lib/api/session";
import type { WsMessage } from "@/lib/api/types";
import { useTranslation } from "@/providers/i18n-provider";

type UseRoomWebSocketOptions = {
  roomId: string;
  enabled?: boolean;
  onMessage?: (msg: WsMessage) => void;
};

function wsBaseUrl(): string {
  return API_BASE_URL.replace(/^http/, "ws");
}

export function useRoomWebSocket({
  roomId,
  enabled = true,
  onMessage,
}: UseRoomWebSocketOptions) {
  const { t } = useTranslation();
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

  const sendReaction = useCallback(
    (emoji: string) => send({ type: "reaction", emoji }),
    [send]
  );

  useEffect(() => {
    if (!enabled || !roomId) return;

    const token = getAuthToken();
    if (!token) {
      setError(t("room.loginRequired"));
      return;
    }

    const url = `${wsBaseUrl()}/ws?token=${encodeURIComponent(token)}`;
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

    ws.onerror = () => setError(t("room.wsConnectError"));
    ws.onclose = () => setConnected(false);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [enabled, roomId, t]);

  return { connected, lastMessage, error, send, sendChat, sendReaction };
}
