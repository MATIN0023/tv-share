// components/WatchTogether.tsx (نسخه کامل)
"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { motion } from "framer-motion";

export function WatchTogether() {
  const features = [
    {
      icon: "👥",
      title: "تماشای گروهی",
      description: "تا ۱۰ نفر همزمان",
    },
    {
      icon: "💬",
      title: "چت زنده",
      description: "گفتگو در حین تماشا",
    },
    {
      icon: "😊",
      title: "واکنش‌های لحظه‌ای",
      description: "ایموجی و استیکر",
    },
    {
      icon: "🎬",
      title: "کنترل مشترک",
      description: "پخش، توقف و جابجایی",
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden py-10">
      <ContainerScroll
        titleComponent={
          <div className="space-y-6 py-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-black dark:text-white"
            >
              تماشای فیلم با{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
                دوستان و عزیزانت
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            >
              فاصله‌ها مهم نیست! با کسایی که دوستشون داری، هر لحظه‌ای رو به
              اشتراک بذار. تماشای همزمان، چت زنده و واکنش‌های لحظه‌ای
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8"
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-xl text-center"
                >
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-sm md:text-base text-black dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {feature.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        }
      >
        {/* تصویر یا ویدیو Demo */}
        <div className="relative w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl overflow-hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" />
          
          {/* محتوای داخل */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-white">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <svg
                className="w-32 h-32 mx-auto mb-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                تجربه تماشای همزمان
              </h3>
              <p className="text-lg opacity-90 max-w-md mx-auto">
                با دوستان، خانواده یا کاپل‌ها، هر لحظه رو با هم زندگی کنید
              </p>
            </motion.div>

            {/* آواتارهای کاربران (نمایشی) */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex -space-x-4 mt-8"
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-2xl"
                >
                  {["👨", "👩", "🧑", "👧"][i - 1]}
                </div>
              ))}
              <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-sm font-bold">
                +6
              </div>
            </motion.div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
