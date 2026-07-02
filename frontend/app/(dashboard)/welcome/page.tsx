"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  DoorOpen,
  Video,
  Users,
  Check,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useTranslation } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

/* ── onboarding step data ── */
function useSteps() {
  const { t } = useTranslation();
  return [
    {
      id: "install",
      icon: Smartphone,
      gradient: "from-violet-600 to-fuchsia-600",
      title: t("welcome.step1Title"),
      desc: t("welcome.step1Desc"),
      isPwaStep: true,
    },
    {
      id: "room",
      icon: DoorOpen,
      gradient: "from-cyan-600 to-blue-600",
      title: t("welcome.step2Title"),
      desc: t("welcome.step2Desc"),
      isPwaStep: false,
    },
    {
      id: "video",
      icon: Video,
      gradient: "from-emerald-600 to-teal-600",
      title: t("welcome.step3Title"),
      desc: t("welcome.step3Desc"),
      isPwaStep: false,
    },
    {
      id: "invite",
      icon: Users,
      gradient: "from-amber-500 to-orange-600",
      title: t("welcome.step4Title"),
      desc: t("welcome.step4Desc"),
      isPwaStep: false,
    },
  ] as const;
}

export default function WelcomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { canInstall, isInstalled, install } = usePwaInstall();
  const steps = useSteps();
  const [current, setCurrent] = useState(0);
  const [installing, setInstalling] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(isInstalled);

  const step = steps[current];
  const isLast = current === steps.length - 1;

  const handleInstall = async () => {
    if (!canInstall) return;
    setInstalling(true);
    const ok = await install();
    if (ok) setPwaInstalled(true);
    setInstalling(false);
  };

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("ms-onboarded", "1");
      router.push("/dashboard");
      return;
    }
    setCurrent((c) => c + 1);
  };

  const handleSkip = () => {
    localStorage.setItem("ms-onboarded", "1");
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-violet-950/20 to-zinc-950 px-4">
      {/* progress dots */}
      <div className="mb-10 flex gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={cn(
              "rounded-full transition-all",
              i === current
                ? "w-6 bg-violet-500 h-2"
                : i < current
                ? "w-2 h-2 bg-violet-500/60"
                : "w-2 h-2 bg-white/15"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* card */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-10 text-center backdrop-blur-xl shadow-2xl shadow-black/50">
            {/* icon */}
            <motion.div
              initial={{ scale: 0.7, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br ${step.gradient} shadow-xl`}
            >
              <step.icon className="size-10 text-white" />
            </motion.div>

            {/* step counter */}
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">
              {t("welcome.stepLabel", {
                current: current + 1,
                total: steps.length,
              })}
            </p>

            <h2 className="text-2xl font-black text-white">{step.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/50">{step.desc}</p>

            {/* PWA install step special UI */}
            {step.isPwaStep ? (
              <div className="mt-6">
                {pwaInstalled || isInstalled ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm text-emerald-400">
                    <Check className="size-4" />
                    {t("welcome.pwaInstalled")}
                  </div>
                ) : canInstall ? (
                  <button
                    type="button"
                    disabled={installing}
                    onClick={handleInstall}
                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-90 disabled:opacity-60"
                  >
                    {installing ? t("welcome.installing") : t("welcome.installBtn")}
                  </button>
                ) : (
                  <p className="rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white/40">
                    {t("welcome.pwaNotAvailable")}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* actions */}
      <div className="mt-8 flex w-full max-w-md items-center justify-between">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-white/30 hover:text-white/60 transition"
        >
          {t("welcome.skip")}
        </button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-500"
        >
          {isLast ? t("welcome.letsGo") : t("welcome.nextStep")}
          {isLast ? (
            <Check className="size-4" />
          ) : (
            <ChevronRight className="size-4 rtl:rotate-180" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
