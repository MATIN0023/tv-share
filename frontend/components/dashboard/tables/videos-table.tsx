"use client";

import { useTranslation } from "@/providers/i18n-provider";

interface VideoRow {
  id: string;
  title: string;
  status: string;
  progress: string;
}

interface VideosTableProps {
  rows: VideoRow[];
  onDelete?: (id: string) => void;
}

export function VideosTable({ rows, onDelete }: VideosTableProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-right">{t("tables.title")}</th>
            <th className="px-3 py-2 text-right">{t("common.status")}</th>
            <th className="px-3 py-2 text-right">{t("tables.progress")}</th>
            <th className="px-3 py-2 text-right">{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <td className="px-3 py-2">{row.title}</td>
              <td className="px-3 py-2 text-primary">{row.status}</td>
              <td className="px-3 py-2">{row.progress}</td>
              <td className="px-3 py-2">
                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(row.id)}
                    className="text-red-400"
                  >
                    {t("common.delete")}
                  </button>
                ) : (
                  <span className="text-muted-foreground">{t("common.dash")}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
