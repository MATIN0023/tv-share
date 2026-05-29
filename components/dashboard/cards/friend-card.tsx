interface FriendCardProps {
  name: string;
  status: "online" | "watching" | "away";
}

const statusLabel: Record<FriendCardProps["status"], string> = {
  online: "آنلاین",
  watching: "در حال تماشا",
  away: "دور از دسترس",
};

export function FriendCard({ name, status }: FriendCardProps) {
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <p className="font-medium">{name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{statusLabel[status]}</p>
    </div>
  );
}
