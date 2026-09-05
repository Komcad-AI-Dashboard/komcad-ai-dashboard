"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  BarChart3,
  Database,
  Eye,
  EyeOff,
  FolderPlus,
  IdCard,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react";
import { loginAction, guestLoginAction, type LoginState } from "./actions";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: LoginState = { error: null };

const FITUR = [
  { icon: UserCog, judul: "Manajemen Profil Anggota", isi: "CRUD data profil, kompetensi, sertifikasi, unit/satuan asal." },
  { icon: Database, judul: "Basis Data Terpusat", isi: "Single source of truth lintas K/L." },
  { icon: FolderPlus, judul: "Pembuatan & Manajemen Misi", isi: "Operator membuat Misi beserta kebutuhan personel." },
  { icon: ShieldCheck, judul: "Verifikasi & Approval Operator", isi: "Operator menyetujui rekomendasi AI sebelum notifikasi dikirim." },
  { icon: Sparkles, judul: "AI Mobilization Engine", isi: "Rekomendasi kandidat berbasis lokasi, kompetensi, readiness, riwayat." },
  { icon: IdCard, judul: "Portal Akses Mandiri Anggota", isi: "Anggota melihat & melengkapi profil, riwayat, status sendiri." },
  { icon: BarChart3, judul: "Dashboard Analitik & Evaluasi", isi: "Riwayat mobilisasi sebagai bahan evaluasi kesiapsiagaan." },
];

function Wordmark({ size }: { size: "sm" | "lg" }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/brand/logo-komcad.png"
        alt="Lambang Komponen Cadangan"
        width={size === "lg" ? 72 : 34}
        height={size === "lg" ? 72 : 34}
        priority
        className={size === "lg" ? "size-[72px] object-contain" : "size-[34px] object-contain"}
      />
      <div>
        <div className={size === "lg" ? "text-[26px] font-black tracking-[0.13em]" : "text-[17px] font-black tracking-[0.13em]"}>
          KOMCAD
        </div>
        <div
          className={
            size === "lg"
              ? "mt-[3px] text-[10px] font-bold tracking-[0.42em] text-accent-bright"
              : "mt-px text-[8.5px] font-bold tracking-[0.3em] text-accent-bright"
          }
        >
          COMMAND CENTER
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [tamuState, tamuAction, tamuPending] = useActionState(guestLoginAction, initialState);
  const [lihatSandi, setLihatSandi] = useState(false);

  const error = state.error ?? tamuState.error;

  return (
    <div className="flex min-h-screen flex-col bg-base xl:flex-row">
      {/* Panel hero — desktop saja. Di HP isinya (peta, 7 kartu fitur) tidak akan terbaca di
          390px dan cuma mendorong form turun jauh, jadi sengaja tidak ditampilkan. */}
      <section className="relative hidden flex-1 overflow-hidden xl:block">
        {/* Prajurit ditambatkan di kiri-bawah supaya bagian atas panel bebas untuk judul. Lebarnya
            ikut mengecil di layar sempit, dan padding kiri daftar fitur di bawah menyesuaikan
            angka yang sama. */}
        <div className="absolute bottom-0 left-0 h-[74%] w-[220px] 2xl:w-[300px]">
          <Image src="/brand/prajurit.jpg" alt="" fill sizes="(min-width: 1536px) 300px, 220px" className="object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-base/25 to-base" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-base to-transparent" />
        </div>

        {/* Tiga zona vertikal: judul, peta, daftar fitur. Peta HARUS punya zonanya sendiri
            (`min-h-0 flex-1`) — dulu ia absolut terhadap seluruh panel di `top-[27%]` sementara
            daftar fitur didorong ke bawah dengan `mt-auto`, jadi tidak ada yang menahan keduanya:
            di 1280x720 peta tergambar menembus teks empat kartu fitur pertama. Sekarang peta
            mengecil mengikuti sisa ruang, bukan menumpuk. */}
        <div className="relative z-10 flex h-full flex-col p-12 [@media(min-width:1280px)_and_(max-height:800px)]:p-8">
          <div className="flex items-start justify-between gap-8">
            <div className="max-w-[380px]">
              <Wordmark size="lg" />
              <div className="my-5 h-px w-14 bg-accent-bright/70" />
              <p className="text-[13px] leading-relaxed text-ink-2">
                Sistem kecerdasan buatan untuk identifikasi, analitik, dan dukungan gerak anggota
                Komcad secara <span className="text-accent-bright">real-time</span>.
              </p>
            </div>

            <div className="shrink-0 rounded-[10px] border border-border-soft bg-base/60 px-5 py-4 backdrop-blur-sm">
              <div className="text-[9px] font-extrabold tracking-[0.22em] text-ink-3">
                WILAYAH INDONESIA
              </div>
              <div className="mt-3 h-px bg-border-soft" />
              <div className="mt-3 font-mono text-[26px] font-extrabold leading-none text-accent-bright">38</div>
              <div className="mt-1 text-[10px] tracking-wide text-ink-2">PROVINSI</div>
              <div className="mt-3 font-mono text-[26px] font-extrabold leading-none text-accent-bright">514</div>
              <div className="mt-1 text-[10px] tracking-wide text-ink-2">KABUPATEN / KOTA</div>
            </div>
          </div>

          {/* Latar peta sudah dijadikan hitam murni, jadi mix-blend-screen melarutkannya ke panel
              tanpa menyisakan kotak. Mask radial memudarkan tepinya supaya batas gambar tidak
              terbaca sebagai garis lurus. */}
          <div className="relative min-h-0 flex-1">
            <Image
              src="/brand/peta.jpg"
              alt=""
              width={962}
              height={352}
              sizes="70vw"
              className="pointer-events-none absolute inset-y-0 right-[2%] my-auto h-auto max-h-full w-[70%] max-w-[680px] object-contain mix-blend-screen [mask-image:radial-gradient(ellipse_at_center,#000_60%,transparent_95%)]"
            />
          </div>

          <div className="pl-[228px] 2xl:pl-[292px]">
            <div className="mb-4 text-[10px] font-extrabold tracking-[0.26em] text-ink-2">
              FITUR UTAMA SISTEM
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-[14px] 2xl:gap-x-8">
              {FITUR.map(({ icon: Icon, judul, isi }) => (
                <div key={judul} className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-accent-bright/25 bg-accent-bright/[0.07] text-accent-bright 2xl:size-9">
                    <Icon className="size-[18px]" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-bold uppercase tracking-wide">{judul}</div>
                    <div className="mt-[3px] text-[10.5px] leading-relaxed text-ink-3">{isi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Panel form. Kartunya butuh 682px, jadi di layar 1280x720 satu halaman kurang 42px dan
          harus di-scroll sedikit. Paddingnya dirapatkan khusus di layar pendek (bukan di semua
          ukuran) supaya laptop 720p/768p muat utuh tanpa mengubah tampilan di layar besar. */}
      <section className="flex w-full items-center justify-center p-6 xl:w-[520px] xl:shrink-0 xl:border-l xl:border-border-soft xl:bg-gradient-to-b xl:from-[#080b0d] xl:to-[#020304] xl:p-10 [@media(min-width:1280px)_and_(max-height:800px)]:p-6">
        <div className="hud-brk hud-panel w-full max-w-[400px] rounded-[16px] border border-border p-7 shadow-[0_40px_100px_rgba(0,0,0,0.92),0_0_60px_rgba(60,242,154,0.06)] [@media(min-width:1280px)_and_(max-height:800px)]:p-5">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/brand/logo-komcad.png"
              alt="Lambang Komponen Cadangan"
              width={92}
              height={92}
              priority
              className="size-[92px] object-contain"
            />
            <div className="mt-4 text-[24px] font-black tracking-[0.13em]">KOMCAD</div>
            <div className="mt-[3px] text-[9.5px] font-bold tracking-[0.4em] text-accent-bright">
              COMMAND CENTER
            </div>
            <div className="my-5 h-px w-12 bg-border" />
          </div>

          <form action={formAction} className="flex flex-col gap-[18px]">
            <div>
              <Label htmlFor="email">Email / User ID</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
                  strokeWidth={1.5}
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Masukkan email atau user ID"
                  required
                  className="h-[42px] pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
                  strokeWidth={1.5}
                />
                <Input
                  id="password"
                  name="password"
                  type={lihatSandi ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  required
                  className="h-[42px] pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setLihatSandi((v) => !v)}
                  aria-label={lihatSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-[6px] text-ink-3 hover:text-ink"
                >
                  {lihatSandi ? (
                    <EyeOff className="size-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="size-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-[9px] text-[12px] text-ink-2">
              <input
                type="checkbox"
                name="remember"
                className="size-[15px] cursor-pointer accent-[var(--accent-bright)]"
              />
              Ingat saya
            </label>

            {error && (
              <div className="rounded-[6px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="solid"
              disabled={pending || tamuPending}
              className="h-[44px] w-full text-[13px] tracking-[0.1em]"
            >
              {pending ? "MEMPROSES..." : "MASUK KE SISTEM"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[9px] font-extrabold tracking-[0.26em] text-ink-3">
              AKSES TERBATAS
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form action={tamuAction}>
            <Button
              type="submit"
              variant="default"
              disabled={pending || tamuPending}
              className="h-[42px] w-full text-[12px] font-semibold"
            >
              <IdCard className="size-4" strokeWidth={1.5} />
              {tamuPending ? "Menyiapkan sesi tamu..." : "Masuk sebagai tamu / observer"}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-[6px] text-[9.5px] font-bold tracking-[0.14em] text-ink-3">
            <ShieldCheck className="size-[13px] text-accent" strokeWidth={1.5} />
            SECURE ENCRYPTED CONNECTION
          </div>

          <p className="mt-4 text-center text-[10px] leading-relaxed text-ink-3">
            Akun demo (data dummy): admin · operator · analis · anggota
            <span className="text-ink-3">@komcad.mil.id</span> — kata sandi{" "}
            <span className="font-mono">komcad123</span>
          </p>
        </div>
      </section>
    </div>
  );
}
