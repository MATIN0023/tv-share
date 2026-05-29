import { cn } from "@/lib/utils";

interface AdminPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminPanel({ title, children, className }: AdminPanelProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 md:p-5",
        className
      )}
    >
      {title ? <h3 className="mb-4 font-semibold text-zinc-200">{title}</h3> : null}
      {children}
    </section>
  );
}
