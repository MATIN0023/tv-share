import { ApiError } from "@/lib/api/client";
import type { ParsedError } from "./types";

export function parseError(err: unknown): ParsedError {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      rawMessage: "offline",
      isNetwork: true,
      isTimeout: false,
      isOffline: true,
      isAbort: false,
    };
  }

  if (err instanceof ApiError) {
    return {
      status: err.status,
      rawMessage: err.message,
      isNetwork: err.status === 0,
      isTimeout: false,
      isOffline: false,
      isAbort: false,
    };
  }

  if (err instanceof TypeError && /fetch|network/i.test(err.message)) {
    return {
      rawMessage: err.message,
      isNetwork: true,
      isTimeout: false,
      isOffline: false,
      isAbort: false,
    };
  }

  if (err instanceof DOMException && err.name === "AbortError") {
    return {
      rawMessage: "abort",
      isNetwork: false,
      isTimeout: false,
      isOffline: false,
      isAbort: true,
    };
  }

  if (err && typeof err === "object") {
    const e = err as {
      message?: string;
      status?: number;
      name?: string;
    };

    if (e.name === "TimeoutError" || /timeout/i.test(e.message ?? "")) {
      return {
        status: e.status,
        rawMessage: e.message ?? "timeout",
        isNetwork: true,
        isTimeout: true,
        isOffline: false,
        isAbort: false,
      };
    }

    return {
      status: e.status,
      rawMessage: e.message ?? String(err),
      isNetwork: false,
      isTimeout: false,
      isOffline: false,
      isAbort: false,
    };
  }

  return {
    rawMessage: String(err ?? "unknown"),
    isNetwork: false,
    isTimeout: false,
    isOffline: false,
    isAbort: false,
  };
}

/** Normalize backend/API text to a lookup slug */
export function messageSlug(message: string): string {
  return message
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}
