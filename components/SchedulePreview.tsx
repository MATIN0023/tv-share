"use client";

import { CalendarDays, Clock3, Users } from "lucide-react";
import { motion } from "framer-motion";
import { DateTimeField } from "@/components/forms/date-time-field";
import { useState } from "react";

export function SchedulePreview() {
  const [scheduledAt, setScheduledAt] = useState("");

  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-5xl liquid-glass rounded-3xl border border-white/10 p-5 md:p-8">
        <motion.h3
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold md:text-3xl"
        >
          زمان‌بندی فارسی واچ‌پارتی
        </motion.h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
          تاریخ و ساعت را با تقویم شمسی انتخاب کن، لینک دعوت بساز و برای دوستانت بفرست.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-4">
            <CalendarDays className="size-5 text-primary" />
            <p className="mt-2 font-medium">تقویم شمسی</p>
            <p className="mt-1 text-xs text-muted-foreground">انتخاب تاریخ دقیق فارسی</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <Clock3 className="size-5 text-primary" />
            <p className="mt-2 font-medium">زمان‌بندی هوشمند</p>
            <p className="mt-1 text-xs text-muted-foreground">اعلان قبل از شروع واچ‌پارتی</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <Users className="size-5 text-primary" />
            <p className="mt-2 font-medium">دعوت گروهی</p>
            <p className="mt-1 text-xs text-muted-foreground">ارسال لینک به دوستان</p>
          </div>
        </div>

        <div className="mt-5">
          <DateTimeField value={scheduledAt} onChange={setScheduledAt} />
        </div>
      </div>
    </section>
  );
}
