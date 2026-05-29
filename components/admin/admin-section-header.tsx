interface AdminSectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminSectionHeader({
  title,
  description,
  action,
}: AdminSectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-zinc-50">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
