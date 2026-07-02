export {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  LOCALES,
  isLocale,
  localeDirection,
  type Locale,
} from "./config";
export { getDictionary } from "./dictionaries";
export { persistLocale, readStoredLocale } from "./storage";
export { translate } from "./translate";
export { tStatic } from "./t-static";
export type { Dictionary, TranslateFn, TranslationParams } from "./types";
