"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tab = "panduan" | "faq" | "modul";
const TABS: { key: Tab; label: string }[] = [
  { key: "panduan", label: "Panduan Pengguna" },
  { key: "faq", label: "Tanya Jawab (FAQ)" },
  { key: "modul", label: "Modul" },
];

function StepCard({ title, steps }: { title: string; steps: { label: string; desc: string }[] }) {
  return (
    <div className="rounded-[8px] border border-border bg-surface p-[14px]">
      <h3 className="mb-3 text-[13px] font-extrabold">{title}</h3>
      <div className="flex flex-col">
        {steps.map((s) => (
          <div key={s.label} className="border-b border-border-soft py-2 last:border-b-0">
            <div className="text-[12px] font-semibold">{s.label}</div>
            <div className="mt-[2px] text-[11.5px] leading-relaxed text-ink-2">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PANDUAN: { title: string; steps: { label: string; desc: string }[] }[] = [
  {
    title: "1. Memulai — Navigasi Dashboard",
    steps: [
      {
        label: "Sidebar kiri",
        desc: 'Berisi seluruh menu utama, dikelompokkan per fungsi (Ringkasan, Operasi, Data Anggota, Laporan, Asisten, Sistem). Gunakan ikon ☰ di pojok kiri atas topbar untuk menyembunyikan/menampilkan sidebar.',
      },
      {
        label: "Panel bawah Overview",
        desc: 'Statistik Anggota, Misi Terbaru, dan AI Mobilization dapat disembunyikan lewat tombol "−" di setiap header panel. Panel yang disembunyikan muncul sebagai chip "+ Nama Panel" untuk ditampilkan lagi.',
      },
      {
        label: "Peta interaktif",
        desc: "Klik marker anggota/zona Misi untuk detail ringkas, gunakan panel Layers (kiri atas peta) untuk mengaktifkan/nonaktifkan lapisan data, atau tombol layar penuh di kanan atas peta.",
      },
    ],
  },
  {
    title: "2. Alur Kerja Operator — Menangani Misi",
    steps: [
      {
        label: "Langkah 1 — Buat Misi",
        desc: 'Klik tombol "BUAT MISI" di topbar (tersedia dari halaman manapun), isi Pemberi Perintah, Jenis Kejadian, Urgensi, Lokasi, dan Deskripsi Misi, lalu klik "Generate Rekomendasi AI".',
      },
      {
        label: "Langkah 2 — Tinjau rekomendasi AI",
        desc: "Sistem menampilkan ringkasan AI dan daftar kandidat personel lengkap dengan skor kecocokan, alasan, dan estimasi waktu kedatangan (ETA).",
      },
      {
        label: "Langkah 3 — Setujui & pantau",
        desc: 'Klik "Setujui & Kirim Notifikasi" untuk memobilisasi kandidat. Pantau kehadiran tiap personel dan tutup Misi + catat evaluasi lewat menu Manajemen Misi.',
      },
    ],
  },
  {
    title: "3. Mengelola Data Anggota",
    steps: [
      {
        label: "Direktori Anggota",
        desc: "Cari, filter status, dan klik baris anggota untuk membuka profil lengkap (kontak, kompetensi, sertifikasi, riwayat pelatihan & penugasan). Tambah/edit/nonaktifkan data hanya tersedia untuk Super Admin & Operator.",
      },
      {
        label: "Kompetensi & Sertifikasi",
        desc: "Pantau status sertifikasi (Aktif / Akan Kedaluwarsa / Kedaluwarsa) seluruh anggota dalam satu tabel — status dihitung otomatis dari tanggal berlaku.",
      },
    ],
  },
];

const FAQ = [
  {
    q: "Bagaimana cara mengetahui anggota mana yang paling siap dimobilisasi?",
    a: 'Buka menu AI Mobilization atau lihat kolom Readiness pada Direktori Anggota — semakin tinggi skor (0–100), semakin siap anggota tersebut. Anda juga bisa bertanya langsung ke menu AI Chat, mis. "bagaimana Readiness nasional saat ini?".',
  },
  {
    q: "Apa yang terjadi jika kandidat rekomendasi AI menolak notifikasi mobilisasi?",
    a: 'Status kehadiran personel tersebut tercatat sebagai "Ditolak" di drawer Manajemen Misi. Kandidat lain yang sudah direkomendasikan AI tetap terlihat di daftar yang sama sebagai cadangan — Operator dapat mengoordinasikan penggantian secara manual dari situ.',
  },
  {
    q: "Bagaimana cara menyembunyikan/menampilkan panel di Overview?",
    a: 'Klik ikon "−" pada pojok kanan header setiap panel untuk menyembunyikannya. Panel yang disembunyikan bisa dimunculkan lagi lewat chip pada bilah kecil tepat di atas panel, atau sekaligus lewat tombol "Sembunyikan/Tampilkan Semua Panel".',
  },
  {
    q: "Siapa yang bisa mengubah data profil anggota?",
    a: "Saat ini pembaruan data anggota (profil, status siaga, kompetensi) dilakukan Super Admin/Operator lewat menu Direktori Anggota. Portal Sisi Anggota untuk anggota memperbarui datanya sendiri masih dalam pengembangan.",
  },
  {
    q: "Apa itu Readiness Score dan bagaimana cara menghitungnya?",
    a: "Skor komposit 0–100 yang menggambarkan kesiapan seorang anggota, dirancang dari kombinasi kompetensi/sertifikasi, riwayat pelatihan, dan riwayat penugasan. Nilai tiap anggota bisa dilihat di kolom Readiness pada Direktori Anggota maupun rata-rata nasional di menu Analitik Kesiapsiagaan.",
  },
  {
    q: "Apakah notifikasi mobilisasi benar-benar terkirim lewat SMS/WhatsApp ke anggota?",
    a: 'Saat ini notifikasi tercatat sebagai simulasi di dalam aplikasi (channel "Aplikasi") dan terlihat oleh Operator di drawer Manajemen Misi. Integrasi kanal SMS/push produksi sungguhan menyusul di rilis berikutnya.',
  },
];

const MODUL = [
  {
    nama: "Modul 1 — Manajemen Data Anggota",
    status: "Aktif" as const,
    desc: "Fondasi Big Data seluruh platform. Modul ini menyimpan dan mengelola profil lengkap tiap anggota Komcad — identitas, demografi, sebaran wilayah, kompetensi/sertifikasi, riwayat pelatihan, hingga status siaga terkini. Fungsinya adalah menjadi satu sumber data terpusat (single source of truth) agar data anggota tidak lagi tersebar di berbagai tempat, sekaligus jadi bahan mentah bagi mesin AI Mobilization untuk menghasilkan rekomendasi yang akurat.",
    fitur: ["CRUD Profil", "Sertifikasi & Kompetensi", "Riwayat Pelatihan", "Peta Sebaran Wilayah"],
  },
  {
    nama: "Modul 2 — Manajemen Misi & AI Mobilization",
    status: "Aktif" as const,
    desc: "Jantung operasional platform. Saat sebuah kejadian terjadi, Operator membuat Misi baru lewat modul ini, lalu AI Mobilization menganalisis Big Data anggota (lokasi, kompetensi, status kesiapan, riwayat penugasan) untuk mengusulkan personel paling sesuai lengkap dengan alasan dan estimasi waktu kedatangan (ETA). Fungsinya mempercepat proses mobilisasi dan membuat keputusan pengerahan personel lebih objektif dan dapat dipertanggungjawabkan.",
    fitur: ["Buat Misi", "Rekomendasi AI", "Persetujuan Operator", "Notifikasi Otomatis", "Pemantauan Kehadiran"],
  },
  {
    nama: "Modul 3 — Analitik & Laporan",
    status: "Aktif" as const,
    desc: "Memberikan visibilitas menyeluruh atas kesiapsiagaan nasional kepada pimpinan dan Analis — mulai dari Readiness Score per wilayah, KPI nasional, hingga riwayat Misi yang sudah selesai. Fungsinya adalah dasar pengambilan keputusan berbasis data: mengidentifikasi wilayah yang perlu diperkuat dan menyusun laporan resmi (PDF/XLSX) untuk kebutuhan pelaporan ke pimpinan.",
    fitur: ["Dashboard Nasional", "Laporan & Ekspor", "Readiness per Wilayah", "Riwayat Mobilisasi"],
  },
  {
    nama: "Modul 4 — Akses Mandiri Anggota",
    status: "Beta" as const,
    desc: "Portal khusus untuk anggota Komcad memantau dan memperbarui datanya sendiri — profil pribadi, riwayat pelatihan, riwayat penugasan, dan status kesiapan — tanpa harus menghubungi Admin. Fungsinya meringankan beban administrasi Operator sekaligus memastikan data anggota selalu diperbarui langsung oleh pemiliknya, termasuk menerima dan merespons notifikasi mobilisasi langsung dari genggaman.",
    fitur: ["Profil Mandiri", "Update Status Siaga", "Notifikasi Mobilisasi"],
  },
  {
    nama: "Modul 5 — AI Chat Assistant",
    status: "Aktif" as const,
    desc: 'Asisten tanya-jawab berbasis bahasa natural yang memungkinkan Operator/Analis menggali data platform tanpa perlu membuka banyak menu — cukup ketik pertanyaan seperti "berapa anggota yang belum pelatihan 3 bulan terakhir" atau "sebaran anggota berdasarkan pendidikan". Fungsinya mempercepat eksplorasi data dan membuat insight lebih mudah diakses, dengan jawaban yang selalu dihitung dari data platform saat itu juga.',
    fitur: ["Tanya-Jawab Data", "Bahasa Natural", "Insight Instan"],
  },
];

export function GuidelineView() {
  const [tab, setTab] = useState<Tab>("panduan");

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="mb-4 flex gap-[6px]">
        {TABS.map((t) => (
          <Chip key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </Chip>
        ))}
      </div>

      <div className={cn("flex flex-col gap-4", tab !== "panduan" && "hidden")}>
        {PANDUAN.map((section) => (
          <StepCard key={section.title} title={section.title} steps={section.steps} />
        ))}
      </div>

      <div className={cn("flex flex-col gap-3", tab !== "faq" && "hidden")}>
        {FAQ.map((item) => (
          <div key={item.q} className="rounded-[8px] border border-border bg-surface p-[14px]">
            <div className="text-[12.5px] font-bold">▸ {item.q}</div>
            <div className="mt-[6px] text-[11.5px] leading-relaxed text-ink-2">{item.a}</div>
          </div>
        ))}
      </div>

      <div className={cn("flex flex-col gap-4", tab !== "modul" && "hidden")}>
        {MODUL.map((m) => (
          <div key={m.nama} className="rounded-[8px] border border-border bg-surface p-[14px]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-[13px] font-extrabold">{m.nama}</h3>
              <Badge color={m.status === "Aktif" ? "green" : "amber"}>{m.status}</Badge>
            </div>
            <p className="text-[12px] leading-relaxed text-ink-2">{m.desc}</p>
            <div className="mt-3 flex flex-wrap gap-[6px]">
              {m.fitur.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-accent-bright/30 bg-accent-bright/10 px-[10px] py-[4px] text-[10.5px] font-bold text-accent-bright"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
