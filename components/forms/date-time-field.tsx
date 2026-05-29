"use client";

import { useMemo } from "react";
import DatePicker, { type DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { CalendarDays } from "lucide-react";

interface DateTimeFieldProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function DateTimeField({ value, onChange }: DateTimeFieldProps) {
  const dateValue = useMemo(() => (value ? new Date(value) : undefined), [value]);

  return (
    <div className="rounded-xl border border-white/10 p-2">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="size-4" />
        زمان‌بندی (تقویم شمسی)
      </div>
      <DatePicker
        value={dateValue}
        onChange={(date: DateObject | DateObject[] | null) => {
          if (!date || Array.isArray(date)) return;
          onChange?.(date.toDate().toISOString());
        }}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        format="YYYY/MM/DD HH:mm"
        inputClass="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-right outline-none"
        containerClassName="w-full"
      />
      <p className="mt-2 text-[11px] text-muted-foreground">
        خروجی این فیلد به‌صورت ISO ذخیره می‌شود و برای API آماده است.
      </p>
    </div>
  );
}
