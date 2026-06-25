"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
}

export function PaginationBar({ page, totalPages, total }: PaginationBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const go = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-500">
      <span>مجموع: {total.toLocaleString("fa-IR")}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => go(page - 1)}
          className="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
        >
          قبلی
        </button>
        <span>
          {page.toLocaleString("fa-IR")} / {totalPages.toLocaleString("fa-IR")}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
          className="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
        >
          بعدی
        </button>
      </div>
    </div>
  );
}
