/** Base URL for the Go API (set in .env.local). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: string }).error)
        : null) ?? res.statusText;

    if (typeof window !== "undefined" && res.status === 401 && token) {
      const { clearSession } = await import("./session");
      clearSession();
      if (!window.location.pathname.startsWith("/login")) {
        const redirect = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?reason=session_expired&redirect=${redirect}`;
      }
    }

    throw new ApiError(message, res.status, data);
  }

  return data as T;
}
