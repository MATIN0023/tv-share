"use client";

import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useTranslation } from "@/providers/i18n-provider";

function CountUp({
  to,
  suffix = "",
  locale,
}: {
  to: number;
  suffix?: string;
  locale: string;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const numLocale = locale === "fa" ? "fa-IR" : "en-US";

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate(latest) {
        setVal(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val.toLocaleString(numLocale)}
      {suffix}
    </span>
  );
}

const STATS = [
  { value: 500, suffix: "+", keyLabel: "statActiveRooms" },
  { value: 10000, suffix: "+", keyLabel: "statUsers" as string },
  { value: 99, suffix: "%", keyLabel: "statUptime" },
  { value: 4, suffix: "K", keyLabel: "statQuality" },
] as const;

export function StatsSection() {
  const { t, locale } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-r from-violet-950 via-purple-950 to-fuchsia-950 py-20"
    >
      {/* grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.keyLabel}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.6 }}
            className="text-center"
          >
            <p className="text-4xl font-black text-white sm:text-5xl">
              {inView ? (
                <CountUp to={stat.value} suffix={stat.suffix} locale={locale} />
              ) : (
                "0"
              )}
            </p>
            <p className="mt-2 text-sm text-white/50">{t(`landing.${stat.keyLabel}`)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
