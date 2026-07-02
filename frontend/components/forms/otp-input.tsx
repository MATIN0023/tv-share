"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function OtpInput({
  length = 5,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  className,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const focusIndex = useCallback((index: number) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmpty = digits.findIndex((d) => d.trim() === "");
      focusIndex(firstEmpty === -1 ? length - 1 : firstEmpty);
    }
  }, [autoFocus, disabled, focusIndex, length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (value.length === length && /^\d+$/.test(value)) {
      onComplete?.(value);
    }
  }, [value, length, onComplete]);

  const updateAt = (index: number, char: string) => {
    const next = digits.map((d, i) => (i === index ? char : d.trim())).join("");
    const cleaned = next.replace(/\s/g, "").slice(0, length);
    onChange(cleaned);
    if (char && index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]?.trim()) {
        updateAt(index, "");
      } else if (index > 0) {
        focusIndex(index - 1);
        updateAt(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      focusIndex(Math.min(pasted.length, length - 1));
    }
  };

  return (
    <div className={cn("flex justify-center gap-2 sm:gap-3", className)} dir="ltr">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "size-12 rounded-xl border-2 border-zinc-700 bg-zinc-950/60 text-center text-xl font-semibold text-white transition sm:size-14",
            "focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/25",
            disabled && "opacity-50"
          )}
          value={digits[index]?.trim() ?? ""}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1);
            if (v) updateAt(index, v);
          }}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
