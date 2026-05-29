export type NotificationType = "room_invite" | "friend_request" | "system";

export interface NotificationRow {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const typeLabel: Record<NotificationType, string> = {
  room_invite: "دعوت به اتاق",
  friend_request: "درخواست دوستی",
  system: "پیام سیستم",
};

interface NotificationsTableProps {
  rows: NotificationRow[];
  onMarkRead?: (id: string) => void;
}

export function NotificationsTable({ rows, onMarkRead }: NotificationsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-right">نوع</th>
            <th className="px-3 py-2 text-right">عنوان</th>
            <th className="px-3 py-2 text-right">زمان</th>
            <th className="px-3 py-2 text-right">وضعیت</th>
            <th className="px-3 py-2 text-right">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-t border-white/10 ${row.read ? "opacity-70" : ""}`}
            >
              <td className="px-3 py-2 text-primary">{typeLabel[row.type]}</td>
              <td className="px-3 py-2">
                <p className="font-medium">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.body}</p>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{row.createdAt}</td>
              <td className="px-3 py-2">{row.read ? "خوانده‌شده" : "جدید"}</td>
              <td className="px-3 py-2">
                {!row.read && onMarkRead ? (
                  <button
                    type="button"
                    onClick={() => onMarkRead(row.id)}
                    className="text-xs text-primary"
                  >
                    علامت‌گذاری خوانده
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
