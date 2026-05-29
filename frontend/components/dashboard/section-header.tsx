import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-4 md:mb-6", className)}>
      <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p>
    </div>
  );
}
