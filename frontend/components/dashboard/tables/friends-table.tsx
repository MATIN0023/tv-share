interface FriendRow {
  name: string;
  username: string;
  status: string;
}

interface FriendsTableProps {
  rows: FriendRow[];
}

export function FriendsTable({ rows }: FriendsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-right">نام</th>
            <th className="px-3 py-2 text-right">یوزرنیم</th>
            <th className="px-3 py-2 text-right">وضعیت</th>
            <th className="px-3 py-2 text-right">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.username} className="border-t border-white/10">
              <td className="px-3 py-2">{row.name}</td>
              <td className="px-3 py-2" dir="ltr">
                {row.username}
              </td>
              <td className="px-3 py-2 text-primary">{row.status}</td>
              <td className="px-3 py-2 text-muted-foreground">پذیرش | حذف | بلاک</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
