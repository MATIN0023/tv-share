import { Input } from "@/components/ui/input";

interface PhoneInputFieldProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function PhoneInputField({ value, onChange }: PhoneInputFieldProps) {
  return (
    <Input
      type="tel"
      dir="ltr"
      className="text-left"
      placeholder="09123456789"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}
