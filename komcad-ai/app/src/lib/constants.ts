// Konstanta domain — satu sumber kebenaran untuk istilah, role, status, dan struktur navigasi.
// Selaras dengan FRD §4 (Roles) dan §5/10-struktur-navigasi.md (Sitemap). Lihat CLAUDE.md §4/§6.

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

/** Sitemap Sisi Anggota (mobile) — referensi komcad-sisi-anggota-mobile.html */
export const MEMBER_NAV: NavItem[] = [
  { label: "Beranda", href: "/m", icon: "Home" },
  { label: "Profil", href: "/m/profil", icon: "User" },
  { label: "Riwayat", href: "/m/riwayat", icon: "History" },
  { label: "Notifikasi", href: "/m/notifikasi", icon: "Bell" },
  { label: "Pengaturan", href: "/m/pengaturan", icon: "Settings" },
];
