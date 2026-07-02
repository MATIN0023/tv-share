import { messageSlug, parseError } from "./parse-error";
import type {
  ErrorAction,
  ErrorContextKey,
  ErrorSeverity,
  ParsedError,
  ResolvedError,
  TranslateFn,
} from "./types";

/** Maps normalized API messages → i18n key under errors.api.* */
const API_MESSAGE_KEYS: Record<string, string> = {
  invalid_credentials: "errors.api.invalidCredentials",
  invalid_or_expired_otp: "errors.api.invalidOtp",
  account_is_suspended: "errors.api.accountSuspended",
  unauthorized: "errors.api.unauthorized",
  access_denied: "errors.api.accessDenied",
  video_not_found: "errors.api.videoNotFound",
  user_not_found: "errors.api.userNotFound",
  room_not_found: "errors.api.roomNotFound",
  phone_number_already_registered: "errors.api.phoneAlreadyRegistered",
  invalid_phone_number_format: "errors.api.invalidPhone",
  password_must_be_at_least_8_characters: "errors.api.passwordTooShort",
  too_many_otp_requests_for_this_number_try_again_later: "errors.api.tooManyOtp",
  too_many_requests: "errors.api.tooManyRequests",
  signup_disabled: "errors.api.signupDisabled",
  login_disabled: "errors.api.loginDisabled",
  maintenance_mode: "errors.api.maintenanceMode",
  invalid_invitation: "errors.api.invalidInvite",
  invitation_expired: "errors.api.inviteExpired",
  cannot_friend_yourself: "errors.api.cannotFriendSelf",
  google_sign_in_is_not_configured: "errors.api.googleNotConfigured",
  invalid_google_token: "errors.api.googleInvalid",
  title_and_original_url_are_required: "errors.api.videoFieldsRequired",
  plan_slug_is_required: "errors.api.planRequired",
  unknown_plan: "errors.api.unknownPlan",
  no_fields_to_update: "errors.api.nothingToUpdate",
  invalid_request_body: "errors.api.invalidRequest",
  ثبتنام_موقتا_غیرفعال_است: "errors.api.signupDisabled",
  ورود_موقتا_غیرفعال_است_فقط_مدیران_میتوانند_وارد_شوند: "errors.api.loginDisabledAdmin",
  ورود_با_کد_یکبارمصرف_غیرفعال_است: "errors.api.otpDisabled",
};

const HTTP_KEYS: Record<number, { title: string; description: string; action: ErrorAction; severity: ErrorSeverity }> = {
  400: { title: "errors.http.400.title", description: "errors.http.400.description", action: "none", severity: "warning" },
  401: { title: "errors.http.401.title", description: "errors.http.401.description", action: "login", severity: "error" },
  403: { title: "errors.http.403.title", description: "errors.http.403.description", action: "support", severity: "error" },
  404: { title: "errors.http.404.title", description: "errors.http.404.description", action: "back", severity: "warning" },
  409: { title: "errors.http.409.title", description: "errors.http.409.description", action: "none", severity: "warning" },
  422: { title: "errors.http.422.title", description: "errors.http.422.description", action: "none", severity: "warning" },
  429: { title: "errors.http.429.title", description: "errors.http.429.description", action: "retry", severity: "warning" },
  500: { title: "errors.http.500.title", description: "errors.http.500.description", action: "retry", severity: "error" },
  502: { title: "errors.http.502.title", description: "errors.http.502.description", action: "retry", severity: "error" },
  503: { title: "errors.http.503.title", description: "errors.http.503.description", action: "retry", severity: "error" },
};

function resolveFromApiMessage(t: TranslateFn, parsed: ParsedError): ResolvedError | null {
  const slug = messageSlug(parsed.rawMessage);
  const key = API_MESSAGE_KEYS[slug];
  if (!key) return null;

  const titleKey = `${key}.title`;
  const descKey = `${key}.description`;
  const title = t(titleKey);
  if (title === titleKey) {
    return {
      title: t("errors.api.generic.title"),
      description: parsed.rawMessage,
      severity: "error",
      action: "none",
      code: slug,
      detail: parsed.rawMessage,
      retryable: false,
    };
  }

  return {
    title,
    description: t(descKey),
    severity: parsed.status === 429 ? "warning" : "error",
    action: parsed.status === 401 ? "login" : "none",
    code: slug,
    detail: parsed.rawMessage,
    retryable: false,
  };
}

function resolveFromNetwork(t: TranslateFn, parsed: ParsedError): ResolvedError | null {
  if (parsed.isAbort) {
    return {
      title: t("errors.network.abort.title"),
      description: t("errors.network.abort.description"),
      severity: "info",
      action: "none",
      code: "abort",
      retryable: false,
    };
  }
  if (parsed.isOffline) {
    return {
      title: t("errors.network.offline.title"),
      description: t("errors.network.offline.description"),
      severity: "warning",
      action: "retry",
      code: "offline",
      retryable: true,
    };
  }
  if (parsed.isTimeout) {
    return {
      title: t("errors.network.timeout.title"),
      description: t("errors.network.timeout.description"),
      severity: "warning",
      action: "retry",
      code: "timeout",
      retryable: true,
    };
  }
  if (parsed.isNetwork) {
    return {
      title: t("errors.network.failed.title"),
      description: t("errors.network.failed.description"),
      severity: "error",
      action: "retry",
      code: "network",
      retryable: true,
    };
  }
  return null;
}

function resolveFromHttp(t: TranslateFn, parsed: ParsedError): ResolvedError | null {
  if (!parsed.status) return null;
  const http = HTTP_KEYS[parsed.status] ?? HTTP_KEYS[500];
  return {
    title: t(http.title),
    description: t(http.description),
    severity: http.severity,
    action: http.action,
    code: `http_${parsed.status}`,
    detail: parsed.rawMessage !== t(http.description) ? parsed.rawMessage : undefined,
    retryable: http.action === "retry",
  };
}

function resolveFromContext(t: TranslateFn, context: ErrorContextKey): ResolvedError {
  const titleKey = `errors.context.${context}.title`;
  const descKey = `errors.context.${context}.description`;
  const title = t(titleKey);
  const description = t(descKey);

  return {
    title: title !== titleKey ? title : t("errors.generic.title"),
    description: description !== descKey ? description : t("errors.generic.description"),
    severity: "error",
    action: "retry",
    code: context,
    retryable: true,
  };
}

export function resolveError(
  t: TranslateFn,
  err: unknown,
  context: ErrorContextKey = "generic"
): ResolvedError {
  const parsed = parseError(err);

  const fromNetwork = resolveFromNetwork(t, parsed);
  if (fromNetwork) return fromNetwork;

  const fromApi = resolveFromApiMessage(t, parsed);
  if (fromApi) return fromApi;

  const fromHttp = resolveFromHttp(t, parsed);
  if (fromHttp) {
    if (context !== "generic") {
      const ctx = resolveFromContext(t, context);
      return {
        ...fromHttp,
        title: ctx.title,
        description:
          fromHttp.detail && fromHttp.detail !== fromHttp.description
            ? `${ctx.description} (${fromHttp.detail})`
            : ctx.description,
      };
    }
    return fromHttp;
  }

  const ctx = resolveFromContext(t, context);
  if (parsed.rawMessage && parsed.rawMessage !== "unknown") {
    return {
      ...ctx,
      detail: parsed.rawMessage,
      description: `${ctx.description} — ${parsed.rawMessage}`,
    };
  }
  return ctx;
}

/** Short message for toasts */
export function resolveErrorMessage(
  t: TranslateFn,
  err: unknown,
  context: ErrorContextKey = "generic"
): string {
  const resolved = resolveError(t, err, context);
  if (resolved.detail && !resolved.description.includes(resolved.detail)) {
    return `${resolved.title}: ${resolved.detail}`;
  }
  return resolved.title;
}
