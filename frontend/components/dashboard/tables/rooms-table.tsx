import Link from "next/link";

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
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-right">اتاق</th>
            <th className="px-3 py-2 text-right">اعضا</th>
            <th className="px-3 py-2 text-right">وضعیت</th>
            <th className="px-3 py-2 text-right">زمان</th>
            <th className="px-3 py-2 text-right">ورود</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <td className="px-3 py-2">{row.name}</td>
              <td className="px-3 py-2">{row.members}</td>
              <td className="px-3 py-2 text-primary">{row.status}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.startAt ?? "-"}</td>
              <td className="px-3 py-2">
                <Link
                  href={`/rooms/${row.id}`}
                  className="text-primary hover:underline"
                >
                  ورود
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
