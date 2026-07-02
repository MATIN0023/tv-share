"use client";

import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n";
import { useTranslation } from "@/providers/i18n-provider";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  className?: string;
  variant?: "compact" | "full";
}

export function LocaleSwitcher({
  className,
  variant = "compact",
}: LocaleSwitcherProps) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {variant === "full" ? (
        <span className="text-sm text-muted-foreground">{t("common.language")}</span>
      ) : null}
      <Languages className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="flex rounded-lg border border-white/10 p-0.5">
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code as Locale)}
            className={cn(
              "rounded-md px-2 py-1 text-xs transition",
              locale === code
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={locale === code}
          >
            {LOCALE_LABELS[code as Locale]}
          </button>
        ))}
      </div>
    </div>
  );
}
