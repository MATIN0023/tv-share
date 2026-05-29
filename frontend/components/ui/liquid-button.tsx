// components/ui/liquid-button.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "default" | "primary" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export const LiquidButton = forwardRef<HTMLButtonElement, LiquidButtonProps>(
  (
    {
      href,
      variant = "default",
      size = "md",
      children,
      className,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: {
        base: "bg-gradient-to-br from-white/[0.15] to-white/[0.05] border-white/[0.2] hover:from-white/[0.2] hover:to-white/[0.1]",
        shadow: "shadow-[0_8px_32px_0_rgba(31,137,164,0.25),inset_0_1px_1px_0_rgba(255,255,255,0.3)]",
        text: "text-white",
      },
      primary: {
        base: "bg-gradient-to-br from-primary/[0.3] to-primary/[0.15] border-primary/[0.3] hover:from-primary/[0.4] hover:to-primary/[0.25]",
        shadow: "shadow-[0_8px_32px_0_rgba(31,137,164,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.3)]",
        text: "text-white",
      },
      ghost: {
        base: "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15]",
        shadow: "shadow-[0_4px_16px_0_rgba(0,0,0,0.2)]",
        text: "text-neutral-300 hover:text-white",
      },
      glass: {
        base: "bg-white/[0.05] border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.2]",
        shadow: "shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
        text: "text-neutral-200 hover:text-white",
      },
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const buttonContent = (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: "spring",
          bounce: 0.2,
          duration: 0.3,
        }}
        className={cn(
          "relative inline-flex items-center justify-center",
          "rounded-full backdrop-blur-xl border",
          "font-medium transition-all duration-300",
          "overflow-hidden group",
          variants[variant].base,
          variants[variant].shadow,
          sizes[size],
          className
        )}
      >
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Shimmer effect */}
        <motion.div
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/[0.15] to-transparent"
        />

        {/* Animated gradient background */}
        <div className="absolute inset-0 rounded-full overflow-hidden opacity-50">
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"
            style={{ backgroundSize: "200% 100%" }}
          />
        </div>

        {/* Text */}
        <span
          className={cn(
            "relative z-10 transition-all duration-300",
            variants[variant].text
          )}
        >
          {children}
        </span>

        {/* Bottom highlight */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full transition-all duration-500" />
      </motion.div>
    );

    if (href) {
      return (
        <Link href={href} className="inline-block">
          {buttonContent}
        </Link>
      );
    }

    return (
      <button ref={ref} {...props} className="">
        {buttonContent}
      </button>
    );
  }
);

LiquidButton.displayName = "LiquidButton";
