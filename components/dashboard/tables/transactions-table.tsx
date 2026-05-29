interface TransactionRow {
  id: string;
  amount: string;
  date: string;
  status: string;
}

interface TransactionsTableProps {
  rows: TransactionRow[];
}

export function TransactionsTable({ rows }: TransactionsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-right">کد</th>
            <th className="px-3 py-2 text-right">مبلغ</th>
            <th className="px-3 py-2 text-right">تاریخ</th>
            <th className="px-3 py-2 text-right">وضعیت</th>
            <th className="px-3 py-2 text-right">فاکتور</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <td className="px-3 py-2">{row.id}</td>
              <td className="px-3 py-2">{row.amount}</td>
              <td className="px-3 py-2">{row.date}</td>
              <td className="px-3 py-2 text-primary">{row.status}</td>
              <td className="px-3 py-2 text-muted-foreground">دانلود</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
