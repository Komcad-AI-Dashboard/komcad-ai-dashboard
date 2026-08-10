"use client";

import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[22px] w-[38px] shrink-0 rounded-full border transition-colors disabled:opacity-50",
        checked ? "border-accent-bright bg-accent-bright/30" : "border-border bg-elevated"
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 size-[16px] -translate-y-1/2 rounded-full transition-all",
          checked ? "left-[18px] bg-accent-bright" : "left-[3px] bg-ink-3"
        )}
      />
    </button>
  );
}
