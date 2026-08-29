// Konstanta domain — satu sumber kebenaran untuk istilah, role, status, dan struktur navigasi.
// Selaras dengan FRD §4 (Roles) dan §5/10-struktur-navigasi.md (Sitemap). Lihat CLAUDE.md §4/§6.

/** Nama produk (Fase 15). Berbeda dari nama program "Komcad" — jangan saling menggantikan. */
export const PRODUK_NAMA = "SIAGA";

/** Kepanjangan akronim SIAGA, dipakai apa adanya di header laporan PDF/XLSX & atribut title. */
export const PRODUK_KEPANJANGAN = "Sistem Identifikasi, Analitik & Gerak Anggota";

/**
 * Kepanjangan yang sudah dipecah per huruf akronim, supaya UI bisa mewarnai S-I-A-G-A tanpa
 * regex rapuh atas `PRODUK_KEPANJANGAN`. Gabungan seluruh pasangan HARUS sama persis dengan
 * `PRODUK_KEPANJANGAN` di atas — kalau salah satunya diubah, ubah keduanya.
 */
export const PRODUK_KEPANJANGAN_SEGMEN = [
  ["S", "istem "],
  ["I", "dentifikasi, "],
  ["A", "nalitik & "],
  ["G", "erak "],
  ["A", "nggota"],
] as const;

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OPERATOR: "OPERATOR",
  ANALIS: "ANALIS",
  ANGGOTA: "ANGGOTA",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  OPERATOR: "Operator Komcad",
  ANALIS: "Analis/Evaluator",
  ANGGOTA: "Anggota Komcad",
};

export const STATUS_SIAGA = {
  AKTIF: "Aktif",
  SIAGA: "Siaga",
  TIDAK_TERSEDIA: "Tidak Tersedia",
} as const;

export const STATUS_MISI = {
  DRAFT: "Draft",
  DIMOBILISASI: "Dimobilisasi",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
} as const;

export const URGENSI_MISI = {
  KRITIS: "Kritis",
  TINGGI: "Tinggi",
  SEDANG: "Sedang",
} as const;

export const STATUS_SERTIFIKASI = {
  AKTIF: "Aktif",
  AKAN_KEDALUWARSA: "Akan Kedaluwarsa",
  KEDALUWARSA: "Kedaluwarsa",
} as const;

export const STATUS_KEHADIRAN = {
  MENUNGGU_RESPONS: "Menunggu Respons",
  DIKONFIRMASI: "Dikonfirmasi",
  DITOLAK: "Ditolak",
  HADIR: "Hadir",
  SELESAI: "Selesai",
} as const;

export const JENIS_KEJADIAN_OPTIONS = [
  "Banjir",
  "Longsor",
  "Gempa Bumi",
  "Kebakaran Hutan",
  "Angin Puting Beliung",
  "Lainnya",
] as const;

/** Taksonomi kompetensi anggota (dipakai sertifikasi seed & scoring AI Mobilization). Satu sumber
 * kebenaran — prisma/data-pools.ts mengimpor ini, jangan duplikasi daftar terpisah di seed. */
export const KOMPETENSI_OPTIONS = [
  "Medis Lapangan",
  "Komunikasi Radio",
  "SAR & Evakuasi",
  "Logistik",
  "Teknik Bangunan",
  "Navigasi Darat",
] as const;

/** Kompetensi yang relevan per Jenis Kejadian (Fase 18, "Simulasi Bencana" terintegrasi Buat
 * Misi) — dipakai untuk menyarankan kebutuhan personel di modal Buat Misi DAN memprioritaskan
 * skor kandidat di AI Mobilization (lib/ai-mobilization.ts). ASUMSI (FRD §11), belum divalidasi
 * doktrin militer resmi — sama statusnya dengan bobot AI Mobilization sebelum Fase 10. "Lainnya"
 * sengaja kosong (tidak ada persyaratan spesifik, scoring kembali ke perilaku lama).
 */
export const JENIS_KEJADIAN_KOMPETENSI: Record<(typeof JENIS_KEJADIAN_OPTIONS)[number], string[]> = {
  "Gempa Bumi": ["SAR & Evakuasi", "Medis Lapangan", "Teknik Bangunan"],
  Banjir: ["SAR & Evakuasi", "Logistik", "Medis Lapangan"],
  Longsor: ["SAR & Evakuasi", "Teknik Bangunan", "Medis Lapangan"],
  "Kebakaran Hutan": ["SAR & Evakuasi", "Logistik", "Komunikasi Radio"],
  "Angin Puting Beliung": ["Teknik Bangunan", "Medis Lapangan", "Logistik"],
  Lainnya: [],
};

export type NavItem = {
  label: string;
  href: string;
  icon: string; // nama ikon lucide-react, lihat components/shell/nav-icon.tsx
  badgeKey?: "misiAktif"; // sumber badge count dinamis, mis. jumlah Misi Aktif
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Sitemap Command Center — 5 grup, 13 menu. Urutan & label harus identik dengan FRD §5. */
export const COMMAND_NAV: NavGroup[] = [
  {
    label: "RINGKASAN",
    items: [{ label: "Overview", href: "/overview", icon: "LayoutDashboard" }],
  },
  {
    label: "OPERASI",
    items: [
      { label: "Manajemen Misi", href: "/misi", icon: "ShieldAlert", badgeKey: "misiAktif" },
      { label: "AI Mobilization", href: "/ai-mobilization", icon: "Sparkles" },
    ],
  },
  {
    label: "DATA ANGGOTA",
    items: [
      { label: "Direktori Anggota", href: "/anggota", icon: "Users" },
      { label: "Kompetensi & Sertifikasi", href: "/sertifikasi", icon: "BadgeCheck" },
      { label: "Riwayat Pelatihan", href: "/pelatihan", icon: "GraduationCap" },
    ],
  },
  {
    label: "LAPORAN",
    items: [
      { label: "Analitik Kesiapsiagaan", href: "/analitik", icon: "BarChart3" },
      { label: "Laporan & Ekspor", href: "/laporan", icon: "FileText" },
      { label: "Riwayat Mobilisasi", href: "/riwayat", icon: "History" },
    ],
  },
  {
    label: "ASISTEN",
    items: [{ label: "AI Chat", href: "/ai-chat", icon: "MessageCircle" }],
  },
  {
    label: "SISTEM",
    items: [
      { label: "Pengguna & Role", href: "/pengguna", icon: "UserCog" },
      { label: "Pengaturan", href: "/pengaturan", icon: "Settings" },
      { label: "Guideline", href: "/guideline", icon: "BookOpen" },
    ],
  },
];

/** Sitemap Sisi Anggota (mobile) — referensi komcad-sisi-anggota-mobile.html. 4 tab (bukan 5) —
 * mockup & FR-37 s.d. FR-40 tidak mencakup layar Pengaturan terpisah untuk Anggota. */
export const MEMBER_NAV: NavItem[] = [
  { label: "Beranda", href: "/m", icon: "Home" },
  { label: "Profil", href: "/m/profil", icon: "User" },
  { label: "Riwayat", href: "/m/riwayat", icon: "History" },
  { label: "Notifikasi", href: "/m/notifikasi", icon: "Bell" },
];
