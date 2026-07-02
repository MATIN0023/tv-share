import type { Dictionary, TranslationParams } from "./types";

function getNestedValue(dict: Dictionary, key: string): unknown {
  const parts = key.split(".");
  let current: unknown = dict;

  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = (current as Dictionary)[part];
  }

  return current;
}

export function translate(
  dict: Dictionary,
  key: string,
  params?: TranslationParams
): string {
  const value = getNestedValue(dict, key);

  if (typeof value !== "string") {
    return key;
  }

  if (!params) {
    return value;
  }

  return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    String(params[name] ?? "")
  );
}
