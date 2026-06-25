import { cn } from "@/lib/utils";

interface LabeledFieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function LabeledField({
  label,
  hint,
  error,
  children,
  className,
}: LabeledFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="block text-sm font-medium text-zinc-200">{label}</label>
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
      {children}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
