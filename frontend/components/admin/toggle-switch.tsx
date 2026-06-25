"use client";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  danger?: boolean;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
  description,
  danger,
}: ToggleSwitchProps) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg border px-3 py-3 ${
        danger ? "border-red-900/40 bg-red-950/20" : "border-zinc-800"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <div>
        {label ? (
          <span className={`text-sm ${danger ? "text-red-300" : ""}`}>{label}</span>
        ) : null}
        {description ? (
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? (danger ? "bg-red-600" : "bg-amber-500") : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition ${
            checked ? "right-0.5" : "right-[1.375rem]"
          }`}
        />
      </button>
    </label>
  );
}
