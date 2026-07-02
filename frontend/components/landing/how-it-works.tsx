"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PlusCircle, UserPlus, Tv2 } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

const STEPS = [
  {
    icon: PlusCircle,
    color: "from-violet-600 to-purple-600",
    glow: "shadow-violet-500/30",
  },
  {
    icon: UserPlus,
    color: "from-fuchsia-600 to-pink-600",
    glow: "shadow-fuchsia-500/30",
  },
  {
    icon: Tv2,
    color: "from-cyan-600 to-blue-600",
    glow: "shadow-cyan-500/30",
  },
] as const;

function StepCard({
  step,
  index,
  inView,
}: {
  step: (typeof STEPS)[number];
  index: number;
  inView: boolean;
}) {
  const { t } = useTranslation();
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition hover:border-white/20 hover:bg-white/8"
    >
      {/* step number connector line */}
      {index < STEPS.length - 1 ? (
        <div className="absolute left-full top-1/2 hidden w-12 -translate-y-1/2 border-t border-dashed border-white/10 lg:block" />
      ) : null}

      {/* icon */}
      <div
        className={`flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-xl ${step.glow}`}
      >
        <Icon className="size-8 text-white" />
      </div>

      {/* step number */}
      <span className="text-4xl font-black text-white/5 group-hover:text-white/10 transition">
        0{index + 1}
      </span>

      <div>
        <h3 className="text-lg font-bold text-white">
          {t(`landing.step${index + 1}Title`)}
        </h3>
        <p className="mt-2 text-sm text-white/50">
          {t(`landing.step${index + 1}Desc`)}
        </p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

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
            {t("landing.howItWorksLabel")}
          </p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            {t("landing.howItWorksTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            {t("landing.howItWorksSubtitle")}
          </p>
        </motion.div>

        {/* steps grid */}
        <div className="relative grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <StepCard key={i} step={step} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
