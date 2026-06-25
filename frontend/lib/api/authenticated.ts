import { getAuthToken } from "./session";
import { apiRequest, ApiError, type RequestOptions } from "./client";

export async function authApiRequest<T>(
  path: string,
  options: Omit<RequestOptions, "token"> = {}
): Promise<T> {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError("لطفاً وارد حساب کاربری شوید", 401);
  }
  return apiRequest<T>(path, { ...options, token });
}
