import { getDictionary } from "./dictionaries";
import { readStoredLocale } from "./storage";
import { translate } from "./translate";
import type { TranslationParams } from "./types";

/** Translate outside React (uses stored locale). */
export function tStatic(key: string, params?: TranslationParams): string {
  return translate(getDictionary(readStoredLocale()), key, params);
}
