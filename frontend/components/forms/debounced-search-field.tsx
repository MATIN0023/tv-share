"use client";

import { useEffect, useState } from "react";
import { SearchField } from "./search-field";
import { useDebouncedValue } from "@/hooks/use-debounce";

interface DebouncedSearchFieldProps {
  placeholder: string;
  value?: string;
  onDebouncedChange: (value: string) => void;
  delayMs?: number;
}

export function DebouncedSearchField({
  placeholder,
  value = "",
  onDebouncedChange,
  delayMs = 400,
}: DebouncedSearchFieldProps) {
  const [local, setLocal] = useState(value);
  const debounced = useDebouncedValue(local, delayMs);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    onDebouncedChange(debounced);
  }, [debounced, onDebouncedChange]);

  return (
    <SearchField
      placeholder={placeholder}
      value={local}
      onChange={setLocal}
    />
  );
}
