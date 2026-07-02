"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

export function CtaSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-zinc-950 px-4 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/80 via-purple-950/60 to-fuchsia-950/80 p-12 text-center shadow-2xl shadow-violet-900/40 backdrop-blur-xl"
      >
        {/* glow blobs */}
        <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 size-64 rounded-full bg-fuchsia-600/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative"
        >
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            {t("landing.ctaTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/60">
            {t("landing.ctaSubtitle")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-500"
            >
              {t("landing.ctaStartFree")}
              <ArrowLeft className="size-4 transition group-hover:-translate-x-1 rtl:rotate-180" />
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/15 px-8 py-3.5 text-sm font-bold text-white/80 transition hover:bg-white/5"
            >
              {t("landing.heroCtaLogin")}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
