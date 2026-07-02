"use client";

import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";

interface RoomRow {
  id: string;
  name: string;
  members: string;
  status: string;
  startAt?: string;
}

interface RoomsTableProps {
  rows: RoomRow[];
}

export function RoomsTable({ rows }: RoomsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-right">{t("tables.room")}</th>
            <th className="px-3 py-2 text-right">{t("tables.members")}</th>
            <th className="px-3 py-2 text-right">{t("common.status")}</th>
            <th className="px-3 py-2 text-right">{t("tables.time")}</th>
            <th className="px-3 py-2 text-right">{t("tables.enter")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <td className="px-3 py-2">{row.name}</td>
              <td className="px-3 py-2">{row.members}</td>
              <td className="px-3 py-2 text-primary">{row.status}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {row.startAt ?? t("common.dash")}
              </td>
              <td className="px-3 py-2">
                <Link
                  href={`/rooms/${row.id}`}
                  className="text-primary hover:underline"
                >
                  {t("tables.enter")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
