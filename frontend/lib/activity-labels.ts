import type { TranslateFn } from "@/lib/i18n";

export function activityActionLabel(t: TranslateFn, action: string): string {
  const key = `activity.actions.${action}`;
  const label = t(key);
  return label === key ? action : label;
}

export function targetTypeLabel(t: TranslateFn, type?: string): string {
  if (!type) return t("common.dash");
  const key = `activity.targets.${type}`;
  const label = t(key);
  return label === key ? type : label;
}
