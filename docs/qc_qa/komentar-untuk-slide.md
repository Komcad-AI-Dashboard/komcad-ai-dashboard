# Komentar untuk slide laporan QA

Satu blok per slide, tinggal copas.

Yang laporan 31 Agustus udah live di production dari tanggal 1 September. Yang 5 September masih
di `staging`, nunggu di-merge.

---

# Laporan 31 Agustus 2026

---

### Buat Misi Baru: Page Couldn't Load

**Udah kelar, dan ternyata bukan gara-gara Safari sama sekali.**

Kita coba reproduksi langsung di production: 4 percobaan, 3 pakai mesin Safari 1 pakai Chrome. Empat-empatnya gagal dengan error yang sama persis. Jadi browsernya gak ada hubungannya, kebetulan aja waktu itu lagi pakai Safari.

Biang keroknya: AI-nya kadang nyebut orang yang sama dua kali dalam satu jawaban. Sistem gak ngebolehin satu orang ditugasin dua kali ke Misi yang sama, jadi seluruh prosesnya gagal sebelum sempat nyimpen apa-apa. Kita ukur, 5 dari 6 panggilan ada duplikatnya, malah pernah satu orang muncul 5 kali sekaligus.

Sekarang duplikatnya dibuang duluan sebelum disimpan. Udah dites ulang 8 kali, gak ada yang lolos lagi.

Satu titipan: kalau log Vercel dari kegagalan waktu itu masih ada, boleh minta? (kode errornya 2097309456). Bukan karena ragu sama perbaikannya, cuma mau mastiin gak ada penyebab kedua yang ketutupan sama yang ini.

---

### Kotak Hijau Suggestion Lokasi

**Udah.** Kotak berbingkainya diganti readout berlabel "TERPILIH", jadi gak mirip daftar yang bisa dipilih lagi. Perilakunya sih dari awal emang udah bener, cuma gayanya yang nyesatin.

**Tapi dari screenshot slide ini kita nemu yang lain, dan ini agak serem.** "Teluk Betung" itu ada empat di Indonesia. Sistemnya diam-diam ngambil yang paling atas, yaitu Kalimantan Selatan, padahal yang dimaksud Bandar Lampung. Bedanya sekitar 1.150 km.

Koordinat itu dipakai buat nyaring kandidat personel. Jadi salah lokasi artinya salah orang yang direkomendasiin, tanpa peringatan apa pun.

Udah dibenerin: kolom Lokasi Misi sekarang ngasih saran sambil ngetik (landmark kayak Way Kambas juga ketemu), dan operator yang milih. Sistemnya berhenti nebak-nebak.

---

### Layer "Kepadatan Wilayah"

**Udah.** Ternyata warnanya tabrakan: layer ini render merah/oranye/biru sesuai kepadatan, persis warna Zona Misi, Anggota Siaga, sama elemen AI. Jadi zona padat keliatan sama kayak Misi kritis.

Sekarang satu warna aja, bedanya di intensitas. Garis tepinya juga dihapus, soalnya itu yang bikin lingkaran numpuk keliatan saling tabrak (yang di laporan disebut "menyatu").

Swatch legendanya ikut dibenerin. Sebelumnya cuma satu titik, dan warnanya cuma bener buat satu dari tiga keadaan.

---

### Filter Region "Misi Terbaru"

**Udah.** Item Misi di panel sekarang bisa diklik, langsung buka drawer detail.

Sekalian ketemu: Misi di Maluku, Maluku Utara, sama Papua gak masuk tab mana pun, jadi dari panel ini emang gak bisa dijangkau sama sekali. Tab MALUKU sama PAPUA udah ditambahin.

---

### Icon/Bar Cakupan

**Udah, tapi belum semua opsi.**

Pill Cakupan sekarang beneran bisa diklik. Pilihannya Nasional plus 15 provinsi, lengkap sama jumlah anggotanya. Peta, statistik, Misi Terbaru, AI Mobilization, angka READINESS sama MISI AKTIF di topbar, badge sidebar, semuanya ikut berubah bareng. Cakupannya juga nempel di URL jadi tahan di-refresh.

**Per-Pangdam belum bisa, dan ini murni soal data, bukan males.** Kodam di sistem baru 11 satuan, itu pun perwakilan 12 provinsi, bukan struktur lengkap. Sulawesi Utara malah belum ada nomor Kodim-nya soalnya gak ketemu sumber yang meyakinkan, dan kita pilih dikosongin daripada ngarang nomor satuan TNI. Kalau disaring per Pangdam sekarang, hasilnya kosong atau salah. Perlu data Kodam/Kodim lengkap dulu.

Catatan kecil: Pos Komando, Kodam, sama Kodim tetap tampil nasional walau cakupannya dipilih. Itu data referensi tetap, bukan data per provinsi, dan udah ditandain "NASIONAL" di panel Layers biar jelas. Aktivitas Pelatihan sama, lokasinya nama pusdiklat bukan alamat, jadi gak ada yang bisa disaring.

---

### Filter "Aktif"

**Udah.** "Aktif" sekarang artinya Dimobilisasi doang. Draft gak ikut kehitung lagi.

Dua hal biar gak kaget pas buka dashboard:

1. Angka MISI AKTIF turun di semua layar. Di database dev 15 jadi 11. Itu emang efek yang diminta, bukan data ilang.
2. Kita tambahin chip "Draft". Tanpa itu Misi Draft cuma ketemu lewat "Semua", padahal justru yang belum dimobilisasi yang paling gak boleh kelewat.

Sedikit cerita: definisi "Aktif" ternyata ditulis ulang di enam tempat beda (chip filter, KPI, badge sidebar, pill topbar, konteks AI Chat). Kalau cuma chip-nya yang dibenerin, angka di topbar bakal beda sama isi tabelnya. Sekarang semua baca dari satu sumber.

---

### Laporan Kesiapsiagaan Nasional

**Udah.** Ringkasan KPI jadi tabel dua kolom bergaris. Readiness per wilayah jadi bar chart urut dari tertinggi, tiap baris bawa nama provinsi, bar, skor, sama jumlah anggotanya sekaligus.

Ditambah garis putus-putus rata-rata nasional, biar pertanyaan "wilayah mana yang di bawah rata-rata" kejawab sekilas.

Penyebab tampilan berantakan sebelumnya: tabelnya dipalsuin pakai spasi, dan itu cuma rapi di font monospace sementara laporannya pakai font biasa.

Ringkasan KPI sengaja dibiarin tabel, gak dikasih diagram. Isinya cuma empat angka, dibikin diagram malah lebih susah dibaca.

---

### Riwayat Mobilisasi: baris tabel tidak bisa diklik

**Udah.** Barisnya sekarang bisa diklik (pakai keyboard juga bisa), buka drawer detail Misi yang nampilin evaluasi lengkap. Kolom "Evaluasi" tetap dipotong "...", tapi sekarang statusnya ringkasan, bukan satu-satunya cara baca.

**Soal catatan "cek semua tabel dengan struktur serupa": udah disisir, aman.** Dari tujuh tabel di Command Center, cuma Riwayat Mobilisasi yang nyembunyiin data.

Tabel Pelatihan sama Sertifikasi emang gak bisa diklik, tapi semua kolomnya tampil utuh dan gak punya halaman detail buat dibuka. Kalau dikasih klik di situ jadinya bikin fitur baru, bukan nambal bug. Jadi dibiarin.

---
---

# Laporan 5 September 2026

Halaman 1 sampai 10 isinya sama persis sama laporan 31 Agustus, jadi bagian Admin gak dikomentarin ulang. Yang di bawah ini buat halaman 12 sampai 16.

Semuanya masih di `staging`, belum production.

---

### Profil: field terkunci tanpa penanda visual

**Udah.** Field yang gak bisa diedit sekarang dikasih tiga penanda sekaligus: ikon gembok, latar yang lebih gelap, sama keterangan kenapa dikunci. Jadi gak ngandelin terang-redup doang lagi, dan tetap kebaca di layar yang brightness-nya rendah.

Keterangannya ditulis per field soalnya alasannya emang beda-beda. Nama Lengkap sama Unit diatur satuan, Usia dihitung dari tanggal lahir, Titik Lokasi diperbarui lewat tombol GPS.

**Dari slide ini ketemu yang lebih serius.** Keempat field itu ternyata dilewatin total sama tombol Tab, jadi yang navigasinya pakai keyboard atau screen reader gak pernah bisa nyampe ke isinya. Sekarang udah bisa dijangkau.

---

### Profil: struktur field Kontak Darurat tidak konsisten

**Udah.** Dipecah jadi dropdown Hubungan sama kolom Nomor Telepon, sejajar sama field kontak lain di halaman yang sama.

175 data lama dipindahin otomatis ke struktur baru. Gak ada satu baris pun yang gagal, dan nilai aslinya tetap disimpan buat jaga-jaga.

Placeholder lamanya bunyinya "Nama (Hubungan) lalu Nomor Telepon", padahal gak ada satu pun data tersimpan yang isinya nama orang. Itu teks sisa dari mockup, ikut dihapus.

Dua tambahan di luar yang diminta. Milih "Lainnya" sekarang munculin isian bebas (huruf doang, 3 sampai 25 karakter), biar yang kesimpen bukan kata "Lainnya" yang gak ngasih info apa-apa. Terus dua-duanya harus keisi atau kosong barengan, soalnya nomor tanpa keterangan siapa pemiliknya ya gak kepake pas lagi dibutuhin.

---

### Riwayat Penugasan menampilkan misi belum direspons

**Udah.** Penugasan di Misi yang masih Draft gak ditampilin lagi. Sisanya dipisah dua bagian kayak yang disaranin: "Menunggu Respons" sama "Riwayat".

**Ternyata masalahnya lebih dalam dari yang keliatan di layar.** Penugasan dibuat pas AI nyusun kandidat, sedangkan notifikasi ke Anggota baru dikirim pas Operator mobilisasi Misi. Padahal buat ngerespons ya butuh notifikasi itu. Jadi selama Misinya masih Draft, Anggota ngeliat permintaan respons yang belum pernah dikirim, dan emang gak ada tombolnya. Efek sampingnya, daftar kandidat AI keliatan duluan sebelum Operator mutusin.

Dua hal lain ikut dibenerin. Badge "Menunggu Respons" sama "Dikonfirmasi" dulu tampil merah kayak error. Terus status kehadiran Anggota ilang begitu Misi punya hasil evaluasi, jadi yang nolak penugasan tetap kebaca kayak ikut turun.

Yang perlu diketahui: angka "Riwayat Penugasan" di Beranda Anggota ikut turun, soalnya Misi Draft gak dihitung lagi.

---

### Review Peran Analis, poin 1: tidak ada perbandingan lintas waktu

**Udah.** Kartu Readiness Nasional sama Sertifikasi Kedaluwarsa sekarang nampilin selisih dari bulan lalu, plus grafik enam bulan terakhir. Selisih per provinsi juga muncul di daftar wilayah, dan laporan PDF Kesiapsiagaan ikut nyetak.

Dua angka itu asalnya beda, dan sengaja gak kita samarin. **Sertifikasi kedaluwarsa dihitung dari tanggal berlaku tiap sertifikasi**, jadi angkanya beneran. **Readiness bulan-bulan sebelumnya direkonstruksi** pakai formula Readiness yang asli di tanggal itu: dua dari tiga komponennya bener-bener dihitung ulang, satu komponen (riwayat penugasan) kebawa dari keadaan sekarang soalnya sistem gak nyimpen kapan status kehadiran berubah. Keterangan ini juga ditulis di halamannya.

**Pas ngerjain ini ketemu cacat lain.** Skor Readiness yang tersimpan ternyata basi di 90 dari 175 anggota. Dia cuma dihitung ulang pas status kehadiran berubah, sementara Misi ditambahin massal lewat skrip tanpa mancing perhitungan itu. Jadi selama ini dashboard nampilin angka yang udah gak cocok sama datanya sendiri. Udah disegerin, dan mulai sekarang riwayatnya kecatat otomatis.

---

### Review Peran Analis, poin 2: tidak ada tempat catatan evaluasi

**Udah.** Di drawer detail Misi yang udah Selesai ada bagian "Catatan Analis". Tiap catatan bawa nama penulisnya, perannya, sama waktunya, jadi beberapa Analis bisa nambah tanpa saling nimpa.

Analis sama Super Admin bisa nulis. Operator bisa baca tapi gak bisa nulis, soalnya Operator udah punya jalurnya sendiri lewat Hasil Evaluasi pas nutup Misi.

Tabel Riwayat Mobilisasi dikasih kolom "Catatan" isinya cacahnya, biar gak perlu buka satu-satu cuma buat tau Misi mana yang udah dibahas.

Catatan cuma bisa ditambahin di Misi yang udah Selesai, jadi aturan "Analis tanpa hak ubah Misi aktif" tetap aman.

---

### Review Peran Analis, poin 3: tidak ada cross-check skor AI dengan hasil misi

**Udah.** Di halaman Analitik Kesiapsiagaan ada bagian baru di bawah, namanya "Evaluasi Rekomendasi AI". Isinya dua tabel: ringkasan per rentang skor AI, terus rincian per Misi selesai lengkap sama rata-rata skor, rata-rata kinerja, durasi, dan evaluasinya.

Hasilnya lumayan keliatan. Personel yang skornya 90-100 rata-rata dinilai 3,56 dari 4, sedangkan yang 70-79 rata-rata 1,71. Jadi korelasinya ada, tapi gak mutlak, dan pengecualiannya sengaja dibiarin keliatan soalnya justru itu yang kepake buat Analis.

**Ini perlu diomongin jujur.** Skor rekomendasinya angka asli yang emang dikeluarin sistem. Tapi penilaian kinerjanya data demo yang kita bikin sendiri, soalnya sistemnya belum punya alur buat nyatet penilaian pas Misi ditutup. Bikin alur pencatatannya itu keputusan terpisah, nanti dibahas lagi.

Kalau maksa pakai data apa adanya, tampilan ini malah nyesatin: rekomendasi terbaik AI keliatan paling jelek kinerjanya. Soalnya data contoh sengaja ninggalin kandidat peringkat teratas tiap Misi berjalan tanpa respons. Makanya analisisnya dibatesin ke Misi yang udah Selesai doang.

---

### Dua angka yang bakal gerak, jangan kaget

Ini bukan temuan QA, tapi efek langsung dari kerjaan di atas.

1. **MISI AKTIF turun**, di staging dari 15 jadi 9. Enam Misi kita tutup jadi Selesai biar bagian Evaluasi Rekomendasi AI ada bahan analisisnya. Otomatis angka Selesai bulan ini naik dari 3 jadi 9.
2. **Readiness Nasional geser** dari 45,7 jadi 47,0. Itu koreksi skor yang tadinya basi, bukan efek fitur barunya.
