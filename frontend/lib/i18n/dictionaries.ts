import type { Locale } from "./config";
import type { Dictionary } from "./types";
import fa from "@/locales/fa.json";
import en from "@/locales/en.json";
import errorsFa from "@/locales/errors.fa.json";
import errorsEn from "@/locales/errors.en.json";

function deepMerge(base: Dictionary, overlay: Dictionary): Dictionary {
  const out: Dictionary = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key] as Dictionary, value as Dictionary);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function mergeErrors(base: Dictionary, errors: Dictionary): Dictionary {
  return {
    ...base,
    errors: {
      ...(base.errors as Dictionary),
      ...errors,
    },
  };
}

const dictionaries: Record<Locale, Dictionary> = {
  fa: mergeErrors(fa as Dictionary, errorsFa as Dictionary),
  en: mergeErrors(en as Dictionary, errorsEn as Dictionary),
};

export function getDictionary(locale: Locale): Dictionary {
  const primary = dictionaries[locale] ?? dictionaries.fa;
  if (locale === "fa") return primary;
  return deepMerge(dictionaries.fa, primary);
}
