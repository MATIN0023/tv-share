import { getAuthToken } from "./session";
import { apiRequest, ApiError, type RequestOptions } from "./client";
import { tStatic } from "@/lib/i18n";

export async function authApiRequest<T>(
  path: string,
  options: Omit<RequestOptions, "token"> = {}
): Promise<T> {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError(tStatic("errors.loginRequired"), 401);
  }
  return apiRequest<T>(path, { ...options, token });
}
