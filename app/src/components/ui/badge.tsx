import { cn } from "@/lib/utils";
import { STATUS_MISI, STATUS_SERTIFIKASI, STATUS_SIAGA, URGENSI_MISI } from "@/lib/constants";

export type BadgeColor = "green" | "amber" | "red" | "cyan" | "gray";

const COLOR_CLASSES: Record<BadgeColor, string> = {
  green: "bg-accent-bright/15 text-accent-bright border-accent-bright/30",
  amber: "bg-amber/15 text-amber border-amber/30",
  red: "bg-red/15 text-[#F5A9A5] border-red/30",
  cyan: "bg-cyan/15 text-cyan border-cyan/30",
  gray: "bg-ink-3/15 text-ink-2 border-border",
};

export function Badge({
  children,
  color = "gray",
  className,
}: {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-[2px] text-[10.5px] font-bold tracking-wide",
        COLOR_CLASSES[color],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Pemetaan status domain -> warna badge. Selalu dipakai bareng label teks (FRD §10.8: status tidak hanya lewat warna). */
export function statusSiagaColor(status: string): BadgeColor {
  if (status === STATUS_SIAGA.AKTIF) return "green";
  if (status === STATUS_SIAGA.SIAGA) return "amber";
  return "gray";
}

export function statusMisiColor(status: string): BadgeColor {
  if (status === STATUS_MISI.SELESAI) return "gray";
  if (status === STATUS_MISI.DIBATALKAN) return "gray";
  if (status === STATUS_MISI.DIMOBILISASI) return "green";
  return "cyan"; // Draft
}

export function urgensiColor(urgensi: string): BadgeColor {
  if (urgensi === URGENSI_MISI.KRITIS) return "red";
  if (urgensi === URGENSI_MISI.TINGGI) return "amber";
  return "cyan"; // Sedang
}

export function statusSertifikasiColor(status: string): BadgeColor {
  if (status === STATUS_SERTIFIKASI.AKTIF) return "green";
  if (status === STATUS_SERTIFIKASI.AKAN_KEDALUWARSA) return "amber";
  return "red"; // Kedaluwarsa
}
