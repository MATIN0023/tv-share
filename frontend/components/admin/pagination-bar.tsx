"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslation } from "@/providers/i18n-provider";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
}

export function PaginationBar({ page, totalPages, total }: PaginationBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const go = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-500">
      <span>{t("pagination.total", { total: total.toLocaleString() })}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => go(page - 1)}
          className="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
        >
          {t("pagination.prev")}
        </button>
        <span>
          {page.toLocaleString()} / {totalPages.toLocaleString()}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
          className="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
        >
          {t("pagination.next")}
        </button>
      </div>
    </div>
  );
}
