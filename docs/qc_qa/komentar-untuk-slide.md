# Komentar untuk slide laporan QA

Satu blok per slide, siap tempel. Semua sudah masuk `staging`, belum production.

---

### Buat Misi Baru: Page Couldn't Load

**Belum bisa diperbaiki, butuh bantuan.**

Pesannya "server error", jadi gagalnya di server, padahal harusnya tidak tergantung browser. Aneh, dan justru itu yang bikin susah ditebak.

Mesin dev kami Windows, Safari tidak ada versinya. Bisa minta tolong submit sekali lagi di Safari, lalu ambil log fungsi di Vercel pas gagal itu? Dari stack trace-nya biasanya langsung ketahuan.

---

### Kotak Hijau Suggestion Lokasi

**Sudah.** Kotak berbingkainya diganti readout berlabel "TERPILIH", tidak lagi mirip daftar yang bisa dipilih. Perilakunya memang sudah benar dari awal, cuma gayanya yang menyesatkan.

**Ada temuan lain dari screenshot slide ini.** "Teluk Betung" itu ada empat di Indonesia. Sistem diam-diam ambil yang teratas, Kalimantan Selatan, padahal yang dimaksud Bandar Lampung. Beda ±1.150 km.

Koordinat itu dipakai menyaring kandidat personel, jadi salah lokasi = salah orang yang direkomendasikan, tanpa peringatan apa pun.

Sudah dibenerin: kolom Lokasi Misi sekarang kasih saran sambil diketik (landmark macam Way Kambas juga ketemu), dan operator yang pilih. Sistem berhenti menebak.

---

### Layer "Kepadatan Wilayah"

**Sudah.** Ternyata tabrakan warna: layer ini render merah/oranye/biru sesuai kepadatan, persis warna Zona Misi, Anggota Siaga, dan elemen AI. Jadi zona padat kelihatan sama seperti Misi kritis.

Sekarang satu warna, bedanya di intensitas. Garis tepinya juga dihapus, itu yang bikin lingkaran bertumpuk kelihatan saling tabrak ("menyatu" di laporan).

Swatch legendanya ikut dibenerin. Sebelumnya cuma satu titik, warnanya cuma benar untuk satu dari tiga keadaan.

---

### Filter Region "Misi Terbaru"

**Sudah.** Item Misi di panel sekarang bisa diklik, buka drawer detail.

Sekalian ketemu: Misi di Maluku, Maluku Utara, dan Papua tidak masuk tab mana pun, jadi tidak bisa dijangkau dari panel ini sama sekali. Tab MALUKU dan PAPUA sudah ditambah.

---

### Icon/Bar Cakupan

**Sudah, tapi tidak semua opsi.**

Pill Cakupan sekarang beneran bisa diklik. Pilihannya Nasional dan 15 provinsi, lengkap dengan jumlah anggota masing-masing. Peta, statistik, Misi Terbaru, AI Mobilization, angka READINESS dan MISI AKTIF di topbar, badge sidebar, semua ikut berubah bareng. Cakupannya juga nempel di URL jadi tahan di-refresh.

**Per-Pangdam belum bisa, dan ini soal data bukan males.** Kodam di sistem baru 11 satuan, itu pun perwakilan 12 provinsi, bukan struktur lengkap. Sulawesi Utara malah belum ada nomor Kodim-nya karena tidak ketemu sumber yang meyakinkan, dan kami pilih kosongkan daripada karang nomor satuan TNI. Kalau disaring per Pangdam sekarang, hasilnya kosong atau salah. Perlu data Kodam/Kodim lengkap dulu.

Catatan kecil: Pos Komando, Kodam, Kodim tetap tampil nasional walau cakupan dipilih. Itu data referensi tetap, bukan data per provinsi. Sudah ditandai "NASIONAL" di panel Layers biar jelas. Aktivitas Pelatihan sama, lokasinya nama pusdiklat bukan alamat, jadi tidak ada yang bisa disaring.

---

### Filter "Aktif"

**Sudah.** "Aktif" sekarang artinya Dimobilisasi saja. Draft tidak ikut kehitung lagi.

Dua hal biar tidak kaget pas buka dashboard:

1. Angka MISI AKTIF turun di semua layar. Di database dev 15 jadi 11. Itu memang efek yang diminta, bukan data hilang.
2. Kami tambah chip "Draft". Tanpa itu Misi Draft cuma ketemu lewat "Semua", padahal justru yang belum dimobilisasi yang paling tidak boleh kelewat.

Sedikit cerita: definisi "Aktif" ternyata ditulis ulang di enam tempat berbeda (chip filter, KPI, badge sidebar, pill topbar, konteks AI Chat). Kalau cuma chip-nya yang dibenerin, angka di topbar bakal beda sama isi tabelnya. Sekarang semua baca satu sumber.

---

### Laporan Kesiapsiagaan Nasional

**Sudah.** Ringkasan KPI jadi tabel dua kolom bergaris. Readiness per wilayah jadi bar chart terurut dari tertinggi, tiap baris bawa nama provinsi, bar, skor, dan jumlah anggotanya sekaligus.

Ditambah garis putus-putus rata-rata nasional, biar "wilayah mana yang di bawah rata-rata" kejawab sekilas.

Penyebab tampilan berantakan sebelumnya: tabelnya dipalsukan pakai spasi, dan itu cuma rapi di font monospace sementara laporannya pakai font biasa.

Ringkasan KPI sengaja dibiarkan tabel, tidak dikasih diagram. Isinya cuma empat angka, dibikin diagram malah lebih susah dibaca.

---

### Riwayat Mobilisasi: baris tabel tidak bisa diklik

**Sudah.** Baris sekarang bisa diklik (keyboard juga bisa), buka drawer detail Misi yang menampilkan evaluasi lengkap. Kolom "Evaluasi" tetap dipotong "...", tapi sekarang statusnya ringkasan, bukan satu-satunya cara baca.

**Soal catatan "cek semua tabel dengan struktur serupa": sudah disisir, hasilnya aman.** Dari tujuh tabel di Command Center, cuma Riwayat Mobilisasi yang menyembunyikan data.

Tabel Pelatihan dan Sertifikasi memang tidak bisa diklik, tapi semua kolomnya tampil utuh dan tidak punya halaman detail untuk dibuka. Kalau dikasih klik di situ jadinya bikin fitur baru, bukan nambal bug. Jadi dibiarkan.
