export const LOCALES = ["fa", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fa";

export const LOCALE_COOKIE = "moviesync-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function localeDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "fa" ? "rtl" : "ltr";
}
