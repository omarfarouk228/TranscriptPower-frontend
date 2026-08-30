"use client";

import { SegmentedControl } from "./SegmentedControl";
import type { Language } from "@/lib/api";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

export function LanguageSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: Language;
  onChange: (value: Language) => void;
  disabled?: boolean;
}) {
  return (
    <SegmentedControl
      ariaLabel="Langue"
      value={value}
      options={OPTIONS}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
