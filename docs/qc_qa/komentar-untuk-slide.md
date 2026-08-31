# Komentar untuk slide laporan QA

Siap tempel ke Google Slides, satu blok per slide. Semua sudah ada di branch `staging`,
belum di production.

---

### Slide "Buat Misi Baru: Page Couldn't Load"

**BELUM — butuh bantuan reproduksi.** Pesannya "server error", jadi kegagalannya di sisi
server, padahal seharusnya tidak bergantung browser. Tidak bisa ditelusuri dari sini: mesin
dev Windows, dan Safari tidak ada versi Windows (WebKit Playwright bukan Safari asli).
**Yang dibutuhkan:** submit Buat Misi sekali lagi di Safari/macOS, lalu ambil log fungsi di
Vercel pada saat gagal itu. Stack trace-nya kemungkinan besar langsung menunjuk penyebabnya.

---

### Slide "Kotak Hijau Suggestion Lokasi"

**SUDAH.** Kotak hijau berbingkai diganti readout berlabel "TERPILIH" — tidak lagi terlihat
seperti daftar yang bisa dipilih. Perilakunya memang sudah benar sejak awal, yang menyesatkan
hanya gayanya.

**Bonus dari slide ini:** dari tangkapan layarnya ketahuan satu bug yang lebih serius.
"Teluk Betung" ada empat di Indonesia, dan sistem diam-diam memakai hasil teratas — Kalimantan
Selatan, ±1.150 km dari Teluk Betung, Bandar Lampung yang dimaksud. Koordinat itu dipakai
menyaring kandidat personel, jadi salah lokasi berarti salah orang yang direkomendasikan, tanpa
tanda apa pun. **Sudah diperbaiki:** kolom Lokasi Misi sekarang memberi saran sambil diketik
(termasuk landmark seperti Way Kambas), dan operator yang memilih — sistem tidak lagi menebak.

---

### Slide "Layer Kepadatan Wilayah"

**SUDAH.** Penyebabnya tabrakan warna: layer ini merender merah/oranye/biru sesuai kepadatan —
warna yang sama persis dengan Zona Misi, Anggota Siaga, dan elemen AI. Zona padat tergambar
dengan merah yang sama dengan Misi kritis.

Sekarang satu warna dengan intensitas bertingkat, dan garis tepinya dihapus — garis tepi itu
yang membuat lingkaran bertumpuk terbaca sebagai cincin saling tabrak ("menyatu" di laporan).
Swatch legendanya juga diperbaiki: sebelumnya satu titik yang warnanya cuma benar untuk satu
dari tiga keadaan.

---

### Slide "Filter Region Misi Terbaru"

**SUDAH.** Item Misi di panel sekarang bisa diklik dan membuka drawer detail Misi.

Ditemukan juga saat mengerjakan ini: Misi di Maluku, Maluku Utara, dan Papua tidak masuk tab
mana pun sehingga tidak bisa dijangkau dari panel ini sama sekali. Tab MALUKU dan PAPUA sudah
ditambahkan.

---

### Slide "Icon/Bar Cakupan"

**SUDAH, dengan satu pengecualian.** Pill "Cakupan" sekarang benar-benar bisa diklik dan
menyaring dashboard: pilihan **Nasional** dan **15 provinsi** (masing-masing dengan jumlah
anggotanya). Peta, statistik, Misi Terbaru, AI Mobilization, angka READINESS & MISI AKTIF di
topbar, dan badge di sidebar — semuanya ikut berubah bersamaan. Cakupan tersimpan di URL, jadi
bertahan saat halaman di-refresh.

**Opsi per-Pangdam belum bisa dibuat, dan ini soal data bukan pilihan desain.** Data Kodam di
sistem baru 11 satuan sebagai perwakilan 12 provinsi, bukan struktur teritorial lengkap —
Sulawesi Utara bahkan belum ada nomor Kodim-nya karena tidak ditemukan sumber yang cukup
meyakinkan (diputuskan lebih baik dikosongkan daripada mengarang nomor satuan TNI). Menyaring
per Pangdam di atas data itu akan mengembalikan hasil kosong atau salah. Butuh data Kodam/Kodim
yang lengkap dulu.

Catatan kecil: layer Pos Komando, Kodam, dan Kodim sengaja tetap tampil nasional walau cakupan
dipilih — data referensi tetap, bukan pengamatan per provinsi. Ditandai "NASIONAL" di panel
Layers supaya jelas. Panel Aktivitas Pelatihan juga begitu (lokasinya berisi nama pusdiklat,
bukan alamat berprovinsi, jadi tidak ada yang bisa disaring).

---

### Slide "Filter Aktif"

**SUDAH.** "Aktif" sekarang berarti **Dimobilisasi saja**; Misi Draft tidak lagi ikut terhitung.

Dua hal yang perlu diketahui sebelum melihat dashboard:

1. **Angka MISI AKTIF turun di semua layar** (di database dev: 15 → 11). Itu memang maksud
   perubahan ini, bukan data hilang.
2. **Ditambahkan chip "Draft"** — tanpa itu Misi Draft cuma bisa ditemukan lewat "Semua",
   padahal justru Misi yang belum dimobilisasi yang paling tidak boleh terlupakan.

Definisi "Aktif" ternyata ditulis terpisah di enam tempat (chip filter, KPI, badge sidebar,
pill topbar, konteks AI Chat). Semuanya sekarang membaca satu sumber, jadi angkanya tidak bisa
berbeda antar layar lagi.

---

### Slide "Laporan Kesiapsiagaan Nasional"

**SUDAH.** Ringkasan KPI jadi tabel dua kolom bergaris, dan Readiness per wilayah jadi bar chart
terurut dari tertinggi — tiap baris membawa nama provinsi, bar, skor, dan jumlah anggotanya
sekaligus. Ditambah garis putus-putus rata-rata nasional, supaya "wilayah mana yang di bawah
rata-rata" terjawab sekilas.

Penyebab tampilan berantakan sebelumnya: tabelnya dipalsukan dengan spasi, padahal itu cuma
sejajar di font monospace sedangkan laporannya pakai font biasa.

Ringkasan KPI sengaja tetap tabel, tidak diberi diagram — isinya empat angka, dan diagram justru
membuatnya lebih sulit dibaca.

---

### Slide "Riwayat Mobilisasi: baris tabel tidak bisa diklik"

**SUDAH.** Baris tabel sekarang bisa diklik (dan bisa lewat keyboard) untuk membuka drawer detail
Misi, yang menampilkan teks evaluasi lengkap. Kolom "Evaluasi" tetap dipotong "..." — sekarang ia
ringkasan, bukan satu-satunya jalan membacanya.

**Soal catatan "cek ke semua tabel dengan struktur serupa" — sudah disisir, dan hasilnya lega:**
dari tujuh tabel di Command Center, hanya Riwayat Mobilisasi yang menyembunyikan data. Tabel
Pelatihan dan Sertifikasi memang tidak bisa diklik, tapi seluruh kolomnya tampil utuh dan tidak
punya detail untuk dibuka — menambahkan klik di sana berarti membuat fitur baru, bukan menambal
cacat. Keduanya dibiarkan.
