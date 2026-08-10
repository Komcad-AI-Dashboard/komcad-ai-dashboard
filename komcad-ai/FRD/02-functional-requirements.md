# 6. Functional Requirements

## 6.1 Modul Manajemen Data Anggota (Big Data Komcad)

| ID | Nama Fitur | Deskripsi | Aktor | Prioritas | Acceptance Criteria |
|---|---|---|---|---|---|
| FR-01 | CRUD Profil Anggota | Admin dapat menambah, mengubah, menonaktifkan data profil utama anggota (identitas, sertifikasi, status keanggotaan) | Admin/Operator | Must | Perubahan tersimpan dan ter-audit-log dengan timestamp & user pelaku; NIK tervalidasi 16 digit |
| FR-02 | Profil CV Lengkap Anggota | Klik nama anggota di Direktori menampilkan drawer profil bergaya CV: foto (placeholder siluet SVG sebelum foto asli diunggah), data pribadi, kontak & tautan sosial media (WhatsApp, Email, Instagram, LinkedIn), kompetensi (chip), sertifikasi, riwayat pelatihan, dan riwayat penugasan — seluruhnya dalam satu tampilan | Admin/Operator, Anggota | Must | Drawer terbuka ≤300ms setelah klik; tautan WhatsApp & Email dapat diklik dan mengarah ke aplikasi terkait; foto asli menggantikan placeholder begitu diunggah |
| FR-03 | Pencatatan Sebaran Wilayah | Sistem menyimpan domisili dan titik lokasi terkini anggota serta menampilkan pada peta Overview | Admin/Operator, Anggota | Must | Titik lokasi ter-update otomatis saat anggota mengubah status siaga |
| FR-04 | Kalkulasi & Tampilan Readiness Score | Sistem menghitung Readiness Score tiap anggota; ditampilkan sebagai bar progres di tabel Direktori Anggota | Sistem (otomatis), Admin | Must | Skor terhitung ulang otomatis maksimal 24 jam setelah ada perubahan data pemicu |
| FR-05 | Riwayat Penugasan & Mobilisasi | Sistem mencatat riwayat penugasan tiap anggota (jenis Misi, durasi, hasil evaluasi), ditampilkan pada bagian "Riwayat Penugasan Terakhir" di profil CV anggota | Sistem, Admin, Anggota | Must | Riwayat terurut kronologis terbaru di atas |
| FR-06 | Manajemen Riwayat Pelatihan & Sertifikasi | Admin/anggota mencatat pelatihan yang diikuti; status sertifikasi otomatis diklasifikasi Aktif / Akan Kedaluwarsa / Kedaluwarsa | Admin, Anggota | Must | Reminder otomatis H-30 sebelum sertifikasi kedaluwarsa; badge status berubah warna otomatis |
| FR-07 | Update Status Ketersediaan/Siaga | Anggota dapat mengubah status siaga (Aktif, Siaga, Tidak Tersedia); status tercermin sebagai warna marker di peta Overview | Anggota, Admin | Must | Perubahan status tercermin di peta Overview dalam ≤5 detik |

## 6.2 Modul Manajemen Misi & AI Mobilization

| ID | Nama Fitur | Deskripsi | Aktor | Prioritas | Acceptance Criteria |
|---|---|---|---|---|---|
| FR-08 | Modal "Buat Misi" | Tombol BUAT MISI di topbar membuka modal form: Pemberi Perintah (teks bebas), Jenis Kejadian (dropdown), Urgensi (dropdown: Kritis/Tinggi/Sedang), Lokasi (teks), Deskripsi Misi (textarea) | Operator | Must | Field kosong memakai default yang wajar pada MVP; validasi wajib penuh di rilis produksi |
| FR-09 | Generate Rekomendasi AI Mobilization | Setelah submit, sistem menampilkan status memproses lalu menghasilkan ringkasan AI (mengutip Pemberi Perintah & Deskripsi Misi) + daftar kandidat dengan skor, alasan, dan ETA | Sistem AI | Must | Hasil tampil ≤30 detik (mockup: ≤1,5 detik); ringkasan AI menyebut nama Pemberi Perintah yang diinput |
| FR-10 | Tampilkan Alasan Rekomendasi (Explainability) | Tiap kandidat menampilkan alasan (jarak, sertifikasi, Readiness Score, jeda penugasan terakhir) dan skor kecocokan (0–100) | Sistem AI | Must | Setiap kandidat menampilkan minimal 3 faktor alasan |
| FR-11 | Estimasi Waktu Kedatangan (ETA) | Sistem menghitung ETA tiap personel dan estimasi waktu seluruh personel berkumpul | Sistem AI | Must | ETA ditampilkan per kandidat pada kartu kandidat |
| FR-12 | Approval & Kirim Notifikasi | Operator menekan "Setujui & Kirim Notifikasi"; sistem menampilkan konfirmasi ID Misi baru dan jumlah kandidat dinotifikasi | Operator | Must | Misi tidak berpindah status "Dimobilisasi" tanpa approval eksplisit; ID Misi format MISI-{tahun}-{urutan} |
| FR-13 | Notifikasi Mobilisasi | Sistem mengirim notifikasi ke anggota terpilih (push/SMS/aplikasi) berisi detail Misi, lokasi, dan waktu lapor | Sistem, Anggota | Must | Notifikasi terkirim ≤1 menit setelah approval; status terkirim/dibaca/direspons tercatat |
| FR-14 | Manajemen Misi (Tabel) | Tabel seluruh Misi dengan kolom ID, Jenis Kejadian, Lokasi, Urgensi (badge warna), Status, Personel; pencarian & filter chip | Operator, Analis | Must | Klik baris membuka drawer detail Misi lengkap dengan daftar rekomendasi AI |
| FR-15 | Pemantauan Kehadiran & Progres Operasi | Operator memantau status kehadiran dan progres tiap personel selama Misi berlangsung | Operator, Anggota | Must | Status per personel terlihat pada drawer detail Misi |
| FR-16 | Penutupan Misi & Evaluasi | Operator menutup Misi setelah operasi selesai; hasil evaluasi otomatis tersimpan ke Riwayat Mobilisasi | Operator | Must | Misi berstatus "Selesai" muncul otomatis di menu Riwayat Mobilisasi |

## 6.3 Modul Overview & Peta Situasi

| ID | Nama Fitur | Deskripsi | Aktor | Prioritas | Acceptance Criteria |
|---|---|---|---|---|---|
| FR-17 | Peta Situasi Interaktif (OpenStreetMap) | Basemap OpenStreetMap dengan filter visual gelap/tactical, dibatasi wilayah Indonesia, menampilkan marker anggota, zona Misi, pos komando | Semua role | Must | Peta dapat di-zoom/pan, dibatasi bounding box Indonesia; klik marker/zona membuka drawer detail |
| FR-18 | Panel Layers (Kontrol Lapisan Peta) | Checkbox untuk menyalakan/mematikan lapisan: Anggota Siap, Anggota Siaga, Zona Misi, Pos Komando | Semua role | Must | Toggle langsung menambah/menghapus lapisan tanpa reload |
| FR-19 | Mode Layar Penuh Peta | Ikon ⛶ mengaktifkan mode layar penuh (peta menutupi seluruh viewport); ikon berubah ✕ untuk keluar | Semua role | Must | Peralihan ≤300ms; ukuran peta otomatis menyesuaikan (invalidateSize) |
| FR-20 | Panel Aktivitas Pelatihan Terbaru | Panel mengambang kanan atas peta menampilkan daftar pelatihan terbaru (nama, lokasi, tanggal, peserta); klik → drawer detail | Semua role | Should | Terurut dari pelatihan terbaru; scroll internal jika melebihi tinggi panel |
| FR-21 | Panel Statistik Anggota | Panel bawah Overview (posisi pertama) menampilkan komposisi gender, total & aktif anggota, dan provinsi terbanyak (bar horizontal) | Semua role | Must | Data teragregasi dari tabel Anggota; bar provinsi diurutkan menurun |
| FR-22 | Panel Misi Terbaru | Panel bawah Overview (posisi kedua) menampilkan feed aktivitas Misi terbaru dengan filter tab wilayah | Semua role | Must | Feed terurut waktu terbaru; filter wilayah instan |
| FR-23 | Panel AI Mobilization (Overview) | Panel bawah Overview (posisi ketiga) menampilkan ringkasan AI untuk Misi paling kritis, kandidat rekomendasi, mini-timeline Readiness | Semua role | Must | Data tersinkron dengan Misi berstatus "Dimobilisasi" paling baru |
| FR-24 | Show/Hide Panel Individual | Tiap panel bawah punya tombol "−" untuk disembunyikan; muncul sebagai chip "+ Nama Panel" untuk dimunculkan lagi | Semua role | Must | Status show/hide per panel tidak saling memengaruhi |
| FR-25 | Show/Hide Semua Panel Sekaligus | Tombol "Sembunyikan Semua Panel" pada situation bar menyembunyikan/menampilkan ketiga panel bawah bersamaan; label berubah otomatis | Semua role | Must | Satu klik memengaruhi seluruh panel; label & tray chip tetap konsisten |

## 6.4 Modul Analitik & Laporan

| ID | Nama Fitur | Deskripsi | Aktor | Prioritas | Acceptance Criteria |
|---|---|---|---|---|---|
| FR-26 | Dashboard Analitik Kesiapsiagaan | KPI Readiness nasional, Misi selesai 30 hari, sertifikasi kedaluwarsa, uptime sistem; bar Readiness per wilayah | Analis, Admin | Must | Data ter-refresh otomatis; bar wilayah diurutkan sesuai data |
| FR-27 | Laporan & Ekspor | Daftar laporan siap unduh (PDF/XLSX) dan formulir laporan baru (filter Wilayah/Misi/Periode) | Analis, Admin | Should | Tombol Unduh mengunduh file sesuai laporan yang dipilih |
| FR-28 | Riwayat Mobilisasi | Tabel historis Misi selesai (ID, jenis, lokasi, tanggal selesai, personel, evaluasi) | Analis, Admin | Must | Data terurut dari Misi terbaru selesai |

## 6.5 Modul AI Chat Assistant (Baru)

| ID | Nama Fitur | Deskripsi | Aktor | Prioritas | Acceptance Criteria |
|---|---|---|---|---|---|
| FR-29 | Antarmuka Percakapan AI Chat | Riwayat percakapan (bubble kiri=AI, kanan=pengguna), kolom input, chip pertanyaan cepat | Operator, Analis, Admin | Must | Saat dibuka, sistem menampilkan contoh percakapan awal (pre-filled) |
| FR-30 | Menjawab Pertanyaan Data Anggota | Menjawab pertanyaan seperti "berapa anggota belum pelatihan 3 bulan terakhir", "sebaran anggota berdasarkan pendidikan" dengan data terstruktur | Sistem AI | Must | Jawaban ≤2 detik (indikator mengetik ditampilkan); jawaban memuat angka/tabel, bukan hanya teks |
| FR-31 | Menjawab Pertanyaan Operasional | Menjawab pertanyaan Readiness nasional, jumlah Misi aktif, status sertifikasi kedaluwarsa | Sistem AI | Must | Jawaban konsisten dengan data pada menu Analitik & Manajemen Misi |
| FR-32 | Fallback Jawaban Tidak Dikenali | Jika pertanyaan tidak cocok, sistem memberi jawaban fallback yang mengarahkan ke jenis pertanyaan/menu terkait | Sistem AI | Should | Fallback tidak pernah berupa halaman kosong/error tanpa penjelasan |

## 6.6 Modul Guideline & Dukungan Pengguna (Baru)

| ID | Nama Fitur | Deskripsi | Aktor | Prioritas | Acceptance Criteria |
|---|---|---|---|---|---|
| FR-33 | Tab Panduan Pengguna | Langkah navigasi dashboard, alur kerja Operator menangani Misi, cara mengelola data anggota — sebagai kartu instruksional bertahap | Semua role | Should | Konten mengikuti istilah & alur identik dengan menu aktual (nama tombol, nama menu) |
| FR-34 | Tab Tanya Jawab (FAQ) | Daftar pertanyaan umum beserta jawaban | Semua role | Should | Minimal 5 pertanyaan paling sering muncul dari pengujian pengguna |
| FR-35 | Tab Modul (Deskripsi Fungsional) | Daftar seluruh modul, tiap modul disertai penjelasan naratif fungsi & manfaatnya, status (Aktif/Beta), chip fitur utama | Semua role | Should | Deskripsi minimal 3 kalimat menjelaskan "fungsinya untuk apa", bukan hanya daftar fitur |
| FR-36 | Navigasi Tab Guideline | Tiga tab (Panduan Pengguna, FAQ, Modul) berpindah tanpa reload halaman | Semua role | Must | Tab aktif ditandai visual jelas; konten tab lain disembunyikan bukan dihapus dari DOM |

## 6.7 Modul Akses Mandiri Anggota (Sisi Anggota)

| ID | Nama Fitur | Deskripsi | Aktor | Prioritas | Acceptance Criteria |
|---|---|---|---|---|---|
| FR-37 | Portal Profil Pribadi | Anggota melihat & melengkapi profil, kompetensi, kontak, tautan sosial media miliknya sendiri | Anggota | Must | Perubahan data sensitif (mis. NIK) memerlukan verifikasi/approval Admin |
| FR-38 | Riwayat Pelatihan & Penugasan Pribadi | Anggota melihat rekam jejak pelatihan dan penugasan miliknya | Anggota | Must | Riwayat hanya menampilkan data milik anggota yang login (data isolation) |
| FR-39 | Status Kesiapan Pribadi | Anggota melihat Readiness Score dan mengubah status ketersediaan pribadi | Anggota | Must | Perubahan status tersinkron ke peta Overview Command Center real-time (FR-07) |
| FR-40 | Notifikasi & Respons Mobilisasi | Anggota menerima dan merespons (konfirmasi/tolak) notifikasi mobilisasi | Anggota | Must | Respons tercatat dan terlihat Operator dalam ≤1 menit |

---
⬅ [Sebelumnya](10-struktur-navigasi.md) | [Daftar Isi](00-README.md) | ➡ [Non-Functional Requirements](03-non-functional-requirements.md)
