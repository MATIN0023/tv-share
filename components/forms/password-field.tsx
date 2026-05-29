import { Input } from "@/components/ui/input";

interface PasswordFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function PasswordField({
  value,
  onChange,
  placeholder = "••••••••",
}: PasswordFieldProps) {
  return (
    <Input
      type="password"
      dir="ltr"
      className="text-left"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}
