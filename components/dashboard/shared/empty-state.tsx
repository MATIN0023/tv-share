import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="liquid-glass rounded-2xl border border-dashed border-white/20 p-6 text-center">
      <Inbox className="mx-auto size-8 text-muted-foreground" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
