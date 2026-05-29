interface LiveRoomCardProps {
  roomName: string;
  friendName: string;
  viewers: string;
}

export function LiveRoomCard({ roomName, friendName, viewers }: LiveRoomCardProps) {
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <p className="font-medium">{roomName}</p>
      <p className="mt-1 text-xs text-muted-foreground">در حال تماشا: {friendName}</p>
      <p className="mt-2 text-xs text-primary">بیننده‌ها: {viewers}</p>
    </div>
  );
}
