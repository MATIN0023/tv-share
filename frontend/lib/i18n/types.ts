export type TranslationParams = Record<string, string | number>;

export type TranslateFn = (
  key: string,
  params?: TranslationParams
) => string;

export type Dictionary = Record<string, unknown>;
