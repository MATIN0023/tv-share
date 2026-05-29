export type TicketStatus = "open" | "pending" | "resolved" | "closed";

export interface TicketRow {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  updatedAt: string;
  lastMessage: string;
}

const statusLabel: Record<TicketStatus, string> = {
  open: "باز",
  pending: "در انتظار پاسخ",
  resolved: "حل‌شده",
  closed: "بسته",
};

interface TicketsTableProps {
  rows: TicketRow[];
  onOpen?: (id: string) => void;
}

export function TicketsTable({ rows, onOpen }: TicketsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-right">کد</th>
            <th className="px-3 py-2 text-right">موضوع</th>
            <th className="px-3 py-2 text-right">دسته</th>
            <th className="px-3 py-2 text-right">وضعیت</th>
            <th className="px-3 py-2 text-right">آخرین بروزرسانی</th>
            <th className="px-3 py-2 text-right">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <td className="px-3 py-2" dir="ltr">
                {row.id}
              </td>
              <td className="px-3 py-2">
                <p className="font-medium">{row.subject}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {row.lastMessage}
                </p>
              </td>
              <td className="px-3 py-2">{row.category}</td>
              <td className="px-3 py-2 text-primary">{statusLabel[row.status]}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.updatedAt}</td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => onOpen?.(row.id)}
                  className="text-xs text-primary"
                >
                  مشاهده
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
