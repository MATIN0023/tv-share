// components/Features.tsx (نسخه پیشرفته)
"use client";
import React, { useMemo } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { motion } from "framer-motion";
import { useTranslation } from "@/providers/i18n-provider";

export function Features() {
  const { t } = useTranslation();

  const items = useMemo(
    () => [
      {
        title: t("landing.bentoGroupWatch"),
        description: t("landing.bentoGroupWatchDesc"),
        header: <WatchTogetherHeader />,
        icon: <span className="text-2xl">👥</span>,
      },
      {
        title: t("landing.bentoQuality"),
        description: t("landing.bentoQualityDesc"),
        header: <QualityHeader />,
        icon: <span className="text-2xl">📺</span>,
      },
      {
        title: t("landing.bentoChat"),
        description: t("landing.bentoChatDesc"),
        header: <ChatHeader />,
        icon: <span className="text-2xl">💬</span>,
      },
      {
        title: t("landing.bentoFavorites"),
        description: t("landing.bentoFavoritesDesc"),
        header: <FavoriteHeader />,
        icon: <span className="text-2xl">❤️</span>,
      },
      {
        title: t("landing.bentoRating"),
        description: t("landing.bentoRatingDesc"),
        header: <RatingHeader />,
        icon: <span className="text-2xl">⭐</span>,
      },
      {
        title: t("landing.bentoDownload"),
        description: t("landing.bentoDownloadDesc"),
        header: <DownloadHeader />,
        icon: <span className="text-2xl">⬇️</span>,
      },
      {
        title: t("landing.bentoSecurity"),
        description: t("landing.bentoSecurityDesc"),
        header: <SecurityHeader />,
        icon: <span className="text-2xl">🛡️</span>,
      },
    ],
    [t]
  );

  return (
    <div className="bg-zinc-950 px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-white md:text-6xl">
            {t("landing.featuresTitle")}{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
              {t("landing.featuresHighlight")}
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/50">
            {t("landing.featuresSubtitle")}
          </p>
        </motion.div>

        <BentoGrid className="max-w-7xl mx-auto">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={i === 3 || i === 6 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}

const WatchTogetherHeader = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="flex -space-x-2">
        {["👨", "👩", "🧑"].map((emoji, i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center text-2xl"
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
);

const QualityHeader = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 relative overflow-hidden">
    <motion.div
      initial={{ scale: 1.2 }}
      whileInView={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="text-white text-6xl font-bold">4K</div>
    </motion.div>
  </div>
);

const ChatHeader = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 relative overflow-hidden">
    <div className="absolute inset-0 flex flex-col justify-end p-4 space-y-2">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white/20 backdrop-blur-sm rounded-lg p-2 max-w-[70%]"
        >
          <div className="h-2 bg-white/50 rounded w-full"></div>
        </motion.div>
      ))}
    </div>
  </div>
);

const FavoriteHeader = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-red-500 to-pink-500 relative overflow-hidden">
    <motion.div
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="text-white text-6xl">❤️</div>
    </motion.div>
  </div>
);

const RatingHeader = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 relative overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="text-white text-3xl"
          >
            ⭐
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const DownloadHeader = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 relative overflow-hidden">
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="text-white text-6xl">⬇️</div>
    </motion.div>
  </div>
);

const SecurityHeader = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 relative overflow-hidden">
    <motion.div
      initial={{ rotate: -180, opacity: 0 }}
      whileInView={{ rotate: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="text-white text-6xl">🛡️</div>
    </motion.div>
  </div>
);
