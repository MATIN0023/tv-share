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

export async function googleLogin(payload: {
  id_token: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/google", {
    method: "POST",
    body: payload,
  });
}

export async function logout(): Promise<void> {
  try {
    await authApiRequest<{ message: string }>("/api/auth/logout", {
      method: "POST",
    });
  } catch {
    // Always clear local session even if server call fails
  }
}

export async function getMe(): Promise<UserProfile> {
  return authApiRequest<UserProfile>("/api/users/me");
}
