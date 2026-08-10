import { cn } from "@/lib/utils";

export function Chip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border px-[10px] py-[4px] font-mono text-[11px] font-bold",
        active
          ? "border-accent-bright bg-accent-bright text-[#00170C]"
          : "border-border bg-elevated text-ink-2 hover:text-ink",
        className
      )}
      {...props}
    />
  );
}
