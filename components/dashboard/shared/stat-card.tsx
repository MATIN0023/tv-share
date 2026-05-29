import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, hint, icon: Icon, className }: StatCardProps) {
  return (
    <section className={cn("liquid-glass rounded-2xl border border-white/10 p-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="size-5 text-primary" />
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      {hint ? <p className="mt-2 text-xs text-emerald-500">{hint}</p> : null}
    </section>
  );
}
