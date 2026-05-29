// components/Features.tsx (نسخه پیشرفته)
"use client";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { motion } from "framer-motion";

export function Features() {
  return (
    <div className="py-20 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-zinc-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-black dark:text-white mb-4">
            چرا{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
              ما رو انتخاب کنی؟
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            بهترین تجربه تماشای آنلاین با امکانات منحصر به فرد
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

// Header Components با انیمیشن
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

const items = [
  {
    title: "تماشای گروهی",
    description: "تا ۱۰ نفر همزمان با دوستات فیلم ببین",
    header: <WatchTogetherHeader />,
    icon: <span className="text-2xl">👥</span>,
  },
  {
    title: "کیفیت ۴K",
    description: "تجربه تماشا با بالاترین کیفیت ممکن",
    header: <QualityHeader />,
    icon: <span className="text-2xl">📺</span>,
  },
  {
    title: "چت زنده",
    description: "گفتگو و واکنش لحظه‌ای در حین تماشا",
    header: <ChatHeader />,
    icon: <span className="text-2xl">💬</span>,
  },
  {
    title: "لیست علاقه‌مندی‌ها",
    description:
      "فیلم‌ها و سریال‌های مورد علاقت رو ذخیره کن و بعداً تماشا کن",
    header: <FavoriteHeader />,
    icon: <span className="text-2xl">❤️</span>,
  },
  {
    title: "امتیازدهی و نظرات",
    description: "نظرت رو با دیگران به اشتراک بذار",
    header: <RatingHeader />,
    icon: <span className="text-2xl">⭐</span>,
  },
  {
    title: "دانلود آفلاین",
    description: "فیلم‌ها رو دانلود کن و بدون اینترنت تماشا کن",
    header: <DownloadHeader />,
    icon: <span className="text-2xl">⬇️</span>,
  },
  {
    title: "امنیت بالا",
    description:
      "اطلاعات شخصی و پرداخت‌های شما با بالاترین استانداردهای امنیتی محافظت می‌شود",
    header: <SecurityHeader />,
    icon: <span className="text-2xl">🛡️</span>,
  },
];
