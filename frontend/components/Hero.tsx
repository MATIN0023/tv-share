"use client";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { motion } from "framer-motion";
import { useTranslation } from "@/providers/i18n-provider";

export default function Hero() {
  const { t } = useTranslation();

  return (
    <HeroHighlight>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [20, -5, 0] }}
        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
        className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto"
      >
        {t("common.appName")}{" "}
        <Highlight className="text-black dark:text-white">
          {t("landing.heroTagline")}
        </Highlight>
      </motion.h1>
    </HeroHighlight>
  );
}
