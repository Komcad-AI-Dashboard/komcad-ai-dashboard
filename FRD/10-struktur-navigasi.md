# 5. Struktur Navigasi (Sitemap Command Center)

Struktur berikut merepresentasikan menu sidebar persis seperti pada mockup `komcad-dashboard.html` — dikelompokkan menjadi 5 grup navigasi. Sidebar dapat disembunyikan/ditampilkan penuh melalui ikon ☰ di topbar (lihat [03-non-functional-requirements.md](03-non-functional-requirements.md) NFR-09, dan [06-ui-ux-style-guide.md](06-ui-ux-style-guide.md) 10.4).

| Grup | Menu | Fungsi Ringkas |
|---|---|---|
| RINGKASAN | **Overview** | Peta situasi nasional real-time + 3 panel ringkasan (Statistik Anggota, Misi Terbaru, AI Mobilization) |
| OPERASI | **Manajemen Misi** | Tabel seluruh Misi, filter status/urgensi, pencarian, drawer detail per Misi |
| OPERASI | **AI Mobilization** | Rekomendasi kandidat aktif + parameter model AI (bobot Readiness/jarak/kompetensi) |
| DATA ANGGOTA | **Direktori Anggota** | Tabel seluruh anggota, pencarian & filter status, klik nama → profil CV lengkap |
| DATA ANGGOTA | **Kompetensi & Sertifikasi** | Tabel status sertifikasi seluruh anggota (Aktif / Akan Kedaluwarsa / Kedaluwarsa) |
| DATA ANGGOTA | **Riwayat Pelatihan** | Tabel riwayat pelatihan seluruh anggota beserta status kelulusan |
| LAPORAN | **Analitik Kesiapsiagaan** | KPI nasional + Readiness Score per wilayah (bar chart horizontal) |
| LAPORAN | **Laporan & Ekspor** | Daftar laporan siap unduh (PDF/XLSX) + penyusun laporan baru |
| LAPORAN | **Riwayat Mobilisasi** | Tabel historis seluruh Misi yang telah selesai beserta evaluasi |
| ASISTEN | **AI Chat** | Antarmuka chat tanya-jawab data platform berbasis bahasa natural |
| SISTEM | **Pengguna & Role** | Kelola daftar pengguna Command Center beserta role masing-masing |
| SISTEM | **Pengaturan** | Preferensi notifikasi & preferensi peta |
| SISTEM | **Guideline** | Panduan Pengguna, Tanya Jawab (FAQ), dan daftar Modul platform |

## Elemen Topbar (tetap di semua halaman)
Urutan kiri ke kanan: tombol toggle sidebar (☰) → judul halaman + breadcrumb → indikator LIVE berdenyut → *(kanan)* pemilih wilayah → tombol **BUAT MISI** → chip Readiness nasional → tombol **MISI AKTIF** (badge merah) → kolom pencarian → ikon pengaturan → tombol Masuk.

## Catatan Navigasi
- Sidebar dapat disembunyikan sepenuhnya (lebar 236px → 0px, transisi halus) lewat ikon ☰.
- Tiap menu memetakan ke satu `view` yang saling eksklusif (hanya satu tampil aktif dalam satu waktu).
- Menu aktif ditandai latar hijau transparan dan teks berwarna accent-bright (`#3CF29A`).

---
⬅ [Sebelumnya](01-pendahuluan-dan-definisi.md) | [Daftar Isi](00-README.md) | ➡ [Functional Requirements](02-functional-requirements.md)
