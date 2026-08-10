import { PRODUK_KEPANJANGAN, PRODUK_KEPANJANGAN_SEGMEN } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Kepanjangan akronim SIAGA sebagai baris mikro di bawah wordmark. Huruf pembentuk akronim
 * (S-I-A-G-A) diberi warna accent supaya hubungannya ke wordmark terbaca sekali lihat, tanpa
 * perlu menambah teks penjelas apa pun. Dipakai di sidebar Command Center & header Sisi Anggota.
 *
 * Bukan client component (tidak ada hook/handler) — aman diimpor dari server maupun client.
 */
export function BrandTagline({ className }: { className?: string }) {
  return (
    <p
      title={PRODUK_KEPANJANGAN}
      className={cn("text-[8px] leading-[1.55] tracking-[0.03em] text-ink-3", className)}
    >
      {PRODUK_KEPANJANGAN_SEGMEN.map(([awal, sisa]) => (
        <span key={awal + sisa}>
          <span className="font-extrabold text-accent-bright/85">{awal}</span>
          {sisa}
        </span>
      ))}
    </p>
  );
}
