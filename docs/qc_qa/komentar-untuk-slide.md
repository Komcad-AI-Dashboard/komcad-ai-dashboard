# Komentar untuk slide laporan QA

Satu blok per slide, siap tempel.

Laporan 31 Agustus sudah live di production sejak 1 September. Laporan 5 September masih di
`staging`, menunggu merge.

---

### Buat Misi Baru: Page Couldn't Load

**Sudah. Ternyata bukan soal Safari sama sekali.**

Kami reproduksi langsung di production: empat percobaan, tiga pakai mesin Safari dan satu pakai Chrome. Keempatnya gagal dengan error yang sama persis. Jadi browsernya tidak ada hubungannya, kebetulan saja waktu itu sedang dipakai Safari.

Penyebabnya: AI kadang menyebut orang yang sama dua kali dalam satu jawaban. Sistem melarang satu orang ditugaskan dua kali ke Misi yang sama, jadi seluruh proses gagal sebelum apa pun tersimpan. Terukur 5 dari 6 panggilan mengandung duplikat, dan satu orang pernah muncul lima kali sekaligus.

Sekarang duplikatnya dibuang sebelum disimpan. Diuji ulang 8 kali, nol duplikat lolos.

**Satu permintaan kecil.** Kalau log Vercel dari kegagalan waktu itu masih ada, kami ingin melihatnya (kode error 2097309456). Bukan karena ragu perbaikannya, tapi untuk memastikan tidak ada penyebab kedua yang tertutup oleh yang ini.

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

---
---

# Laporan 5 September 2026

Halaman 1 sampai 10 sama persis dengan laporan 31 Agustus, jadi bagian Admin tidak dikomentari ulang. Yang di bawah untuk halaman 12 sampai 16.

Semua masih di `staging`, belum production.

---

### Profil: field terkunci tanpa penanda visual

**Sudah.** Field yang tidak bisa diedit sekarang punya tiga penanda sekaligus: ikon gembok, latar lebih gelap, dan keterangan alasannya. Tidak lagi cuma soal terang atau redup, jadi tetap kebaca di layar yang brightness-nya rendah.

Alasannya ditulis per field karena memang beda-beda. Nama Lengkap dan Unit diatur satuan, Usia dihitung dari tanggal lahir, Titik Lokasi diperbarui lewat tombol GPS.

**Ada temuan lain yang lebih serius dari slide ini.** Keempat field itu dulu dilewati sama sekali oleh tombol Tab, jadi pengguna keyboard dan pembaca layar tidak pernah bisa sampai ke nilainya. Sekarang bisa dijangkau.

---

### Profil: struktur field Kontak Darurat tidak konsisten

**Sudah.** Dipecah jadi dropdown Hubungan dan kolom Nomor Telepon, sejajar dengan field kontak lain di halaman yang sama.

175 data lama dipindahkan otomatis ke struktur baru. Nol baris gagal, dan nilai aslinya tetap disimpan sebagai cadangan.

Placeholder lamanya berbunyi "Nama (Hubungan) lalu Nomor Telepon", padahal tidak ada satu pun data tersimpan yang memuat nama orang. Itu teks sisa dari mockup, ikut dihapus.

Dua tambahan di luar yang diminta. Memilih "Lainnya" sekarang memunculkan isian bebas (huruf saja, 3 sampai 25 karakter), supaya yang tersimpan bukan kata "Lainnya" yang tidak memberi tahu apa-apa. Dan kedua bagian harus lengkap atau kosong dua-duanya, karena nomor tanpa keterangan siapa pemiliknya tidak berguna justru saat dibutuhkan.

---

### Riwayat Penugasan menampilkan misi belum direspons

**Sudah.** Penugasan pada Misi berstatus Draft tidak ditampilkan lagi. Sisanya dipisah dua bagian seperti yang disarankan: "Menunggu Respons" dan "Riwayat".

**Masalahnya ternyata lebih dalam dari yang terlihat di layar.** Penugasan dibuat saat AI menyusun kandidat, sedangkan notifikasi ke Anggota baru dikirim ketika Operator memobilisasi Misi. Padahal merespons butuh notifikasi itu. Jadi selama Misinya masih Draft, Anggota melihat permintaan respons yang belum pernah dikirim dan memang tidak ada tombolnya. Efek sampingnya, daftar kandidat AI kelihatan sebelum Operator memutuskan.

Dua hal lain diperbaiki sekalian. Badge "Menunggu Respons" dan "Dikonfirmasi" dulu tampil merah seperti error. Dan status kehadiran Anggota hilang begitu Misi punya hasil evaluasi, sehingga yang menolak penugasan tetap terbaca seolah ikut turun.

Yang perlu diketahui: angka "Riwayat Penugasan" di Beranda Anggota ikut turun, karena Misi Draft tidak lagi dihitung.

---

### Review Peran Analis, poin 1: tidak ada perbandingan lintas waktu

**Sudah.** Kartu Readiness Nasional dan Sertifikasi Kedaluwarsa sekarang menampilkan selisih dari bulan lalu, ditambah grafik enam bulan terakhir. Selisih per provinsi juga muncul di daftar wilayah, dan laporan PDF Kesiapsiagaan ikut mencetaknya.

Dua angka itu asalnya beda, dan sengaja tidak kami samarkan. **Sertifikasi kedaluwarsa dihitung dari tanggal berlaku tiap sertifikasi**, jadi angkanya nyata. **Readiness bulan-bulan sebelumnya direkonstruksi** memakai formula Readiness yang asli pada tanggal itu: dua dari tiga komponennya benar-benar terhitung ulang, satu komponen (riwayat penugasan) dibawa dari keadaan sekarang karena sistem tidak menyimpan kapan status kehadiran berubah. Keterangan ini juga tertulis di halamannya.

**Ketemu satu cacat lain waktu mengerjakan ini.** Skor Readiness yang tersimpan ternyata basi di 90 dari 175 anggota. Ia cuma dihitung ulang saat status kehadiran berubah, sementara Misi ditambahkan massal lewat skrip tanpa memicu perhitungan itu. Jadi dashboard selama ini menampilkan angka yang tidak lagi cocok dengan datanya sendiri. Sudah disegarkan, dan mulai sekarang riwayatnya ikut tercatat otomatis.

---

### Review Peran Analis, poin 2: tidak ada tempat catatan evaluasi

**Sudah.** Di drawer detail Misi yang sudah Selesai ada bagian "Catatan Analis". Tiap catatan membawa nama penulis, perannya, dan waktunya, jadi beberapa Analis bisa menambah tanpa saling menimpa.

Analis dan Super Admin bisa menulis. Operator bisa membaca tapi tidak menulis, karena Operator sudah punya jalurnya sendiri lewat Hasil Evaluasi saat menutup Misi.

Tabel Riwayat Mobilisasi dapat kolom "Catatan" berisi cacahnya, supaya tidak perlu membuka satu per satu untuk tahu Misi mana yang sudah dibahas.

Catatan hanya bisa ditambahkan pada Misi yang sudah Selesai, jadi aturan "Analis tanpa hak ubah Misi aktif" tetap utuh.

---

### Review Peran Analis, poin 3: tidak ada cross-check skor AI dengan hasil misi

**Sudah.** Halaman Analitik Kesiapsiagaan punya bagian baru di bawah, "Evaluasi Rekomendasi AI". Isinya dua tabel: ringkasan per rentang skor AI, lalu rincian per Misi selesai lengkap dengan rata-rata skor, rata-rata kinerja, durasi, dan evaluasinya.

Hasilnya kelihatan. Personel berskor 90 sampai 100 rata-rata dinilai 3,56 dari 4, sedangkan yang 70 sampai 79 rata-rata 1,71. Korelasinya nyata tapi tidak mutlak, dan pengecualiannya sengaja dibiarkan terlihat karena justru itu yang berguna buat Analis.

**Perlu dijelaskan apa adanya.** Skor rekomendasinya angka yang memang dikeluarkan sistem. Penilaian kinerjanya data demo yang kami bangkitkan, karena sistem belum punya alur untuk mencatat penilaian saat Misi ditutup. Membangun alur pencatatan itu keputusan terpisah.

Kalau memakai data apa adanya, tampilan ini justru menyesatkan: rekomendasi terbaik AI terlihat paling buruk kinerjanya, karena data contoh sengaja membiarkan kandidat peringkat teratas tiap Misi berjalan tanpa respons. Analisisnya karena itu dibatasi ke Misi yang sudah Selesai saja.

---

### Dua angka yang bergerak, mohon tidak kaget

Bukan temuan QA, tapi akibat langsung dari pekerjaan di atas.

1. **MISI AKTIF turun**, di staging dari 15 jadi 9. Enam Misi ditutup jadi Selesai supaya bagian Evaluasi Rekomendasi AI punya bahan analisis. Angka Selesai bulan ini otomatis naik dari 3 jadi 9.
2. **Readiness Nasional bergeser** dari 45,7 jadi 47,0. Itu koreksi skor yang sudah basi, bukan efek fitur barunya.
