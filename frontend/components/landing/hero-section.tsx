"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Play, Users, Zap, ArrowDown } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "@/providers/i18n-provider";

/* ── 3-D mock "app preview" rendered in CSS ── */
function AppPreview3D({ t }: { t: (key: string) => string }) {
  const navItems = t("landing.previewNav").split("|");
  const chatMessages = [
    t("landing.previewChat1"),
    t("landing.previewChat2"),
    t("landing.previewChat3"),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 20, y: 60 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1200 }}
      className="pointer-events-none select-none"
    >
      <div
        className="relative mx-auto w-full max-w-3xl rounded-2xl border border-white/20 bg-zinc-950/90 shadow-[0_40px_120px_rgba(124,58,237,0.4)] backdrop-blur-sm"
        style={{ transform: "rotateX(4deg) rotateY(-2deg)" }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-red-500/70" />
            <span className="size-3 rounded-full bg-yellow-500/70" />
            <span className="size-3 rounded-full bg-green-500/70" />
          </div>
          <div className="mx-auto rounded-md bg-white/5 px-12 py-1 text-xs text-white/30">
            moviesync.app
          </div>
        </div>

        {/* App layout mock */}
        <div className="flex h-52 sm:h-64">
          {/* sidebar */}
          <div className="hidden w-44 flex-col gap-2 border-r border-white/10 p-3 sm:flex">
            {navItems.map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                  i === 1 ? "bg-violet-600/20 text-violet-300" : "text-white/30"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    i === 1 ? "bg-violet-400" : "bg-white/20"
                  }`}
                />
                {item}
              </div>
            ))}
          </div>

          {/* main content */}
          <div className="flex-1 p-3 sm:p-4">
            {/* video player mock */}
            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gradient-to-br from-violet-900/60 to-purple-900/40 sm:h-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex size-10 items-center justify-center rounded-full bg-violet-600/80 shadow-lg backdrop-blur-sm"
                >
                  <Play className="size-4 fill-white text-white" />
                </motion.div>
              </div>
              {/* progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <motion.div
                  animate={{ width: ["30%", "55%"] }}
                  transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                  className="h-full rounded-full bg-violet-500"
                />
              </div>
            </div>
            {/* viewers row */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex -space-x-1 rtl:space-x-reverse">
                {["🧑", "👩", "👨", "🧑‍💻"].map((e, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.12 }}
                    className="flex size-6 items-center justify-center rounded-full border border-white/20 bg-zinc-800 text-xs"
                  >
                    {e}
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-violet-400">{t("landing.previewLive")}</span>
            </div>
            {/* chat messages */}
            <div className="mt-2 space-y-1">
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={msg}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.2 }}
                  className="w-fit rounded-lg bg-white/5 px-2 py-0.5 text-xs text-white/60"
                >
                  {msg}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── pill stat ── */
function StatPill({
  icon,
  value,
  label,
  delay = 0,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm"
    >
      <span className="text-violet-400">{icon}</span>
      <div>
        <p className="text-sm font-bold leading-none text-white">{value}</p>
        <p className="mt-0.5 text-[10px] text-white/50">{label}</p>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-950 via-violet-950/30 to-zinc-950 px-4 pb-24 pt-28"
    >
      {/* animated grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* radial glow */}
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[120px]"
      />

      {/* badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300"
      >
        <Zap className="size-3.5" />
        {t("landing.heroNewBadge")}
      </motion.div>

      {/* headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="max-w-3xl text-center text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
      >
        {t("landing.heroTitle1")}{" "}
        <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
          {t("landing.heroTitle2")}
        </span>
        <br />
        {t("landing.heroTitle3")}
      </motion.h1>

      {/* subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mt-6 max-w-xl text-center text-base text-white/60 sm:text-lg"
      >
        {t("landing.heroSubtitle")}
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 flex flex-wrap justify-center gap-3"
      >
        <Link
          href="/signup"
          className="rounded-xl bg-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-500 hover:shadow-violet-500/50"
        >
          {t("landing.heroCtaStart")}
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
        >
          {t("landing.heroCtaLogin")}
        </Link>
      </motion.div>

      {/* stat pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="mt-10 flex flex-wrap justify-center gap-3"
      >
        <StatPill icon={<Users className="size-4" />} value={t("landing.statUsersValue")} label={t("landing.statUsers")} delay={0.6} />
        <StatPill icon={<Play className="size-4" />} value={t("landing.statRoomsValue")} label={t("landing.statRooms")} delay={0.7} />
        <StatPill icon={<Zap className="size-4" />} value={t("landing.statFreeBadge")} label={t("landing.statFree")} delay={0.8} />
      </motion.div>

      {/* 3D app preview */}
      <div className="mt-16 w-full max-w-3xl px-4">
        <AppPreview3D t={t} />
      </div>

      {/* scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 flex flex-col items-center gap-1 text-white/30"
      >
        <ArrowDown className="size-4" />
        <span className="text-[10px]">{t("landing.scrollHint")}</span>
      </motion.div>
    </section>
  );
}
