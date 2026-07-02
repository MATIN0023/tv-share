// components/ui/stateful-button.tsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/providers/i18n-provider";

interface StatefulButtonProps {
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  loadingText?: string;
  successText?: string;
  className?: string;
}

export const StatefulButton: React.FC<StatefulButtonProps> = ({
  onClick,
  disabled = false,
  type = "button",
  children,
  loadingText,
  successText,
  className = "",
}) => {
  const { t } = useTranslation();
  const resolvedLoading = loadingText ?? t("statefulButton.loading");
  const resolvedSuccess = successText ?? t("statefulButton.success");
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = async () => {
    if (buttonState !== "idle" || disabled) return;

    setButtonState("loading");
    
    try {
      if (onClick) {
        await onClick();
      }
      setButtonState("success");
      setTimeout(() => setButtonState("idle"), 2000);
    } catch (error) {
      setButtonState("idle");
    }
  };

  return (
    <button
      type={type}
      onClick={type === "button" ? handleClick : undefined}
      disabled={disabled || buttonState === "loading"}
      className={`relative inline-flex h-12 w-full overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-slate-800 dark:focus:ring-offset-slate-900 ${className}`}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 dark:bg-slate-900 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl transition-all">
        {buttonState === "idle" && children}
        {buttonState === "loading" && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {resolvedLoading}
          </motion.span>
        )}
        {buttonState === "success" && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {resolvedSuccess}
          </motion.span>
        )}
      </span>
    </button>
  );
};
