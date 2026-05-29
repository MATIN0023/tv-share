"use client";

import { useState } from "react";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Plus, Power } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string;
  active: boolean;
};

const initialPlans: Plan[] = [
  {
    id: "p1",
    name: "پایه",
    price: "۰",
    duration: "رایگان",
    features: "720p، ۵ روم/ماه، ۲GB آپلود",
    active: true,
  },
  {
    id: "p2",
    name: "نقره‌ای",
    price: "۱۹۹,۰۰۰",
    duration: "۱ ماهه",
    features: "1080p، ۲۰ روم، ۱۰GB",
    active: true,
  },
  {
    id: "p3",
    name: "طلایی",
    price: "۴۹۹,۰۰۰",
    duration: "۳ ماهه",
    features: "4K، ۱۰۰ روم، ۴۰GB، بدون تبلیغ",
    active: true,
  },
  {
    id: "p4",
    name: "قدیمی ۲۰۲۴",
    price: "۹۹,۰۰۰",
    duration: "۱ ماهه",
    features: "غیرفعال برای خرید جدید",
    active: false,
  },
];

const transactions = [
  { id: "TX-8821", user: "علی ر.", amount: "۲۹۹,۰۰۰", gateway: "زرین‌پال", status: "موفق", ref: "ZP-99102" },
  { id: "TX-8820", user: "مهدی م.", amount: "۱۹۹,۰۰۰", gateway: "زیبال", status: "ناموفق", ref: "ZB-44120" },
];

export default function AdminPlansPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [tab, setTab] = useState<"plans" | "transactions">("plans");

  return (
    <div>
      <AdminSectionHeader
        title="پلن‌ها و اشتراک"
        description="ساخت/ویرایش پلن، غیرفعال‌سازی و مشاهده تراکنش‌ها."
      />

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("plans")}
          className={`rounded-lg px-3 py-2 text-sm ${
            tab === "plans" ? "bg-amber-500/20 text-amber-400" : "text-zinc-500"
          }`}
        >
          پلن‌ها
        </button>
        <button
          type="button"
          onClick={() => setTab("transactions")}
          className={`rounded-lg px-3 py-2 text-sm ${
            tab === "transactions" ? "bg-amber-500/20 text-amber-400" : "text-zinc-500"
          }`}
        >
          تراکنش‌ها
        </button>
      </div>

      {tab === "plans" ? (
        <>
          <div className="mb-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm text-zinc-950"
            >
              <Plus className="size-4" />
              پلن جدید
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <AdminPanel key={plan.id}>
                <div className="flex items-start justify-between">
                  <p className="font-semibold">{plan.name}</p>
                  <span
                    className={`text-xs ${plan.active ? "text-emerald-500" : "text-zinc-500"}`}
                  >
                    {plan.active ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold text-amber-400">{plan.price} تومان</p>
                <p className="text-sm text-zinc-500">{plan.duration}</p>
                <p className="mt-2 text-xs text-zinc-400">{plan.features}</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" className="flex-1 rounded border border-zinc-700 py-1.5 text-xs">
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPlans((prev) =>
                        prev.map((p) =>
                          p.id === plan.id ? { ...p, active: !p.active } : p
                        )
                      )
                    }
                    className="flex-1 rounded border border-zinc-700 py-1.5 text-xs"
                  >
                    <Power className="inline size-3" />{" "}
                    {plan.active ? "غیرفعال" : "فعال"}
                  </button>
                </div>
              </AdminPanel>
            ))}
          </div>
        </>
      ) : (
        <AdminPanel title="تراکنش‌های پرداخت">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="px-3 py-2 text-right">کد</th>
                  <th className="px-3 py-2 text-right">کاربر</th>
                  <th className="px-3 py-2 text-right">مبلغ</th>
                  <th className="px-3 py-2 text-right">درگاه</th>
                  <th className="px-3 py-2 text-right">پیگیری</th>
                  <th className="px-3 py-2 text-right">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2">{tx.id}</td>
                    <td className="px-3 py-2">{tx.user}</td>
                    <td className="px-3 py-2">{tx.amount}</td>
                    <td className="px-3 py-2">{tx.gateway}</td>
                    <td className="px-3 py-2" dir="ltr">
                      {tx.ref}
                    </td>
                    <td
                      className={`px-3 py-2 ${
                        tx.status === "موفق" ? "text-emerald-500" : "text-red-400"
                      }`}
                    >
                      {tx.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      )}
    </div>
  );
}
