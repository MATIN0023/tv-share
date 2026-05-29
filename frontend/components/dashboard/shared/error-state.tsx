import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <AlertTriangle className="mx-auto size-8 text-red-400" />
      <h3 className="mt-3 font-semibold text-red-300">{title}</h3>
      <p className="mt-2 text-sm text-red-200/90">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl border border-red-300/40 px-3 py-2 text-sm text-red-100"
        >
          تلاش مجدد
        </button>
      ) : null}
    </div>
  );
}
