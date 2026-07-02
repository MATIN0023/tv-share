import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";

const STORAGE_KEY = LOCALE_COOKIE;

export function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage && isLocale(fromStorage)) {
      return fromStorage;
    }
  } catch {
    // ignore
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`)
  );
  const fromCookie = match?.[1];
  if (fromCookie && isLocale(fromCookie)) {
    return fromCookie;
  }

  return DEFAULT_LOCALE;
}

export function persistLocale(locale: Locale): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }

  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}
