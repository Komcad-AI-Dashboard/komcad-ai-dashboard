/** Placeholder foto profil — siluet generik sampai foto asli diunggah (FRD §10.6). */
export function AvatarPlaceholder({ size = 72 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 flex-col items-center justify-center gap-[2px] overflow-hidden rounded-[10px] border border-border bg-elevated"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size * 0.55} height={size * 0.55} fill="none">
        <circle cx="32" cy="32" r="32" fill="#0E1215" />
        <circle cx="32" cy="24" r="11" fill="#3A4550" />
        <path d="M10 56c0-13 9.8-20 22-20s22 7 22 20" fill="#3A4550" />
      </svg>
      <span className="px-1 text-center text-[6.5px] leading-none text-ink-3">
        Foto belum tersedia
      </span>
    </div>
  );
}
