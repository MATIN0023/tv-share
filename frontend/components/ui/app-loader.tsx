"use client";

import { HamsterLoader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/i18n-provider";

export type AppLoaderVariant = "page" | "section" | "inline" | "compact";

const sizeByVariant: Record<AppLoaderVariant, string> = {
  page: "14px",
  section: "12px",
  inline: "10px",
  compact: "7px",
};

export type AppLoaderProps = {
  variant?: AppLoaderVariant;
  label?: string;
  showLabel?: boolean;
  className?: string;
};

/** Centered hamster loader — use for pages, sections, modals, and inline blocks. */
export function AppLoader({
  variant = "section",
  label,
  showLabel = true,
  className,
}: AppLoaderProps) {
  const { t } = useTranslation();
  const text = label ?? t("common.loading");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        variant === "page" && "min-h-[60vh] w-full",
        variant === "section" && "w-full py-10",
        variant === "inline" && "w-full py-6",
        variant === "compact" && "py-1",
        className
      )}
    >
      <HamsterLoader size={sizeByVariant[variant]} />
      {showLabel ? (
        <p
          className={cn(
            "text-muted-foreground",
            variant === "compact" ? "text-xs" : "text-sm"
          )}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

export function PageLoader(props: Omit<AppLoaderProps, "variant">) {
  return <AppLoader variant="page" {...props} />;
}

export function InlineLoader(props: Omit<AppLoaderProps, "variant">) {
  return <AppLoader variant="inline" {...props} />;
}

export function CompactLoader(props: Omit<AppLoaderProps, "variant">) {
  return <AppLoader variant="compact" {...props} />;
}
