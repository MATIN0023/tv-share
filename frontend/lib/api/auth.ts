import { apiRequest } from "./client";
import { authApiRequest } from "./authenticated";
import type {
  AuthResponse,
  LoginPayload,
  OTPRequestPayload,
  OTPVerifyPayload,
  RegisterPayload,
  UserProfile,
} from "./types";

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function requestOTP(
  payload: OTPRequestPayload
): Promise<{ message: string; phone: string }> {
  return apiRequest("/auth/otp/request", { method: "POST", body: payload });
}

export async function verifyOTP(payload: OTPVerifyPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/otp/verify", {
    method: "POST",
    body: payload,
  });
}

export async function getMe(): Promise<UserProfile> {
  return authApiRequest<UserProfile>("/api/users/me");
}
