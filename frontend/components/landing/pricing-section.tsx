"use client";

import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import Link from "next/link";
import { useRef, type MouseEvent } from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

/* ── plan definitions ── */
const PLANS = [
  {
    key: "free" as const,
    icon: Zap,
    color: "from-slate-600 to-slate-700",
    border: "border-white/10",
    glow: "",
    highlighted: false,
  },
  {
    key: "pro" as const,
    icon: Sparkles,
    color: "from-violet-600 to-purple-700",
    border: "border-violet-500/50",
    glow: "shadow-[0_0_60px_rgba(139,92,246,0.25)]",
    highlighted: true,
  },
  {
    key: "premium" as const,
    icon: Crown,
    color: "from-amber-500 to-orange-600",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_60px_rgba(245,158,11,0.15)]",
    highlighted: false,
  },
] as const;

/* ── 3D tilt card ── */
function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn("cursor-default", className)}
    >
      {children}
    </motion.div>
  );
}

function PlanCard({
  plan,
  index,
  inView,
}: {
  plan: (typeof PLANS)[number];
  index: number;
  inView: boolean;
}) {
  const { t } = useTranslation();
  const Icon = plan.icon;

  const featureKeys: string[] = t(`landing.${plan.key}Features`)
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ perspective: 1000 }}
      className="relative"
    >
      {/* popular badge */}
      {plan.highlighted ? (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1 text-xs font-bold text-white shadow-lg">
            {t("landing.popularBadge")}
          </span>
        </div>
      ) : null}

      <TiltCard>
        <div
          className={cn(
            "relative flex flex-col overflow-hidden rounded-3xl border bg-zinc-900/80 p-8 backdrop-blur-sm",
            plan.border,
            plan.glow,
            plan.highlighted && "bg-zinc-900"
          )}
        >
          {/* gradient top band */}
          <div
            className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${plan.color} opacity-80`}
          />

          {/* inner glow for highlighted */}
          {plan.highlighted ? (
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-violet-600/5 to-transparent" />
          ) : null}

          {/* icon */}
          <div
            className={`mb-5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.color}`}
          >
            <Icon className="size-6 text-white" />
          </div>

          {/* name */}
          <p className="text-sm font-semibold uppercase tracking-widest text-white/50">
            {t(`landing.${plan.key}Name`)}
          </p>

          {/* price */}
          <div className="mt-3 flex items-end gap-1">
            <span className="text-5xl font-black text-white">
              {t(`landing.${plan.key}Price`)}
            </span>
            {plan.key !== "free" ? (
              <span className="mb-2 text-sm text-white/40">
                {t("landing.perMonth")}
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-sm text-white/40">
            {t(`landing.${plan.key}Desc`)}
          </p>

          {/* divider */}
          <div className="my-6 h-px bg-white/5" />

          {/* features */}
          <ul className="flex-1 space-y-3">
            {featureKeys.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-violet-400" />
                <span className="text-white/70">{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/signup"
            className={cn(
              "mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition",
              plan.highlighted
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 hover:opacity-90"
                : "border border-white/10 text-white/80 hover:bg-white/5"
            )}
          >
            {plan.key === "free"
              ? t("landing.ctaStartFree")
              : t("landing.ctaChoosePlan")}
          </Link>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export function PricingSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-zinc-950 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">
            {t("landing.pricingLabel")}
          </p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            {t("landing.pricingTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            {t("landing.pricingSubtitle")}
          </p>
        </motion.div>

        {/* cards */}
        <div className="grid gap-8 sm:grid-cols-3">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.key} plan={plan} index={i} inView={inView} />
          ))}
        </div>

        {/* footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center text-xs text-white/30"
        >
          {t("landing.pricingFootnote")}
        </motion.p>
      </div>
    </section>
  );
}
