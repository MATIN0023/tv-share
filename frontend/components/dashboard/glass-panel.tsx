import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassPanelProps {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function GlassPanel({
  title,
  description,
  className,
  children,
}: GlassPanelProps) {
  return (
    <section
      className={cn(
        "liquid-glass rounded-2xl border border-white/10 p-4 md:p-5",
        className
      )}
    >
      <h2 className="text-base font-semibold md:text-lg">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </section>
  );
}
