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
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-right">عنوان</th>
            <th className="px-3 py-2 text-right">وضعیت</th>
            <th className="px-3 py-2 text-right">پیشرفت</th>
            <th className="px-3 py-2 text-right">عملیات</th>
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
                    حذف
                  </button>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
