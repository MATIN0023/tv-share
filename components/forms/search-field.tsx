import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchFieldProps {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchField({ placeholder, value, onChange }: SearchFieldProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2">
      <Search className="size-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="border-0 bg-transparent px-0 py-0 ring-0 focus-visible:ring-0"
        placeholder={placeholder}
      />
    </div>
  );
}
