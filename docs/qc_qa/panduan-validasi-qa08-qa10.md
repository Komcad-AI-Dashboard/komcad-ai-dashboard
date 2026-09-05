# Panduan Validasi QA-08 & QA-10 (Sisi Anggota)

Dua temuan dari Laporan QA 5 September 2026, halaman 12 dan halaman 14.

Status: sudah ada di branch `staging` (commit `c997610`), belum masuk `main`/production.

| Temuan | Halaman | Isi |
|---|---|---|
| QA-08 | 12 | Field profil yang terkunci tidak punya penanda visual yang jelas |
| QA-10 | 14 | Tab Riwayat > Penugasan menampilkan Misi Draft yang belum direspons |

---

## Sebelum mulai: datanya beda antar lingkungan

Ini yang paling sering bikin validasi keliru, jadi dibaca dulu.

Akun demo Anggota `anggota@komcad.mil.id` tertaut ke ANG-00001 Ahmad Pratama di ketiga database,
tapi isi penugasannya tidak sama:

| Lingkungan | Penugasan akun demo | Bisa dipakai validasi |
|---|---|---|
| Dev (lokal) | 0 | QA-08 saja |
| Staging | 0 | QA-08 saja |
| Production | 4, persis kasus di laporan | QA-08 dan QA-10 |

Production punya MISI-2026-025, 026, 027 (semuanya Draft, "Menunggu Respons") ditambah
MISI-2026-024 (Dimobilisasi, "Dikonfirmasi"). Tiga yang pertama itu justru yang difoto Michael
di halaman 14.

Artinya:

- **QA-08 bisa divalidasi sekarang juga di staging.** Tidak butuh data khusus.
- **QA-10 tidak bisa divalidasi di staging apa adanya**, tab Penugasan akan tampil kosong dengan
  tulisan "Belum ada riwayat penugasan." Itu bukan bug, memang tidak ada datanya.

Untuk QA-10 ada dua jalan, pilih salah satu:

1. Saya tambahkan 4 baris penugasan uji ke database staging supaya semua cabang tampilan bisa
   dilihat, lalu dihapus lagi setelah selesai. Butuh persetujuan dulu karena ini menulis ke
   database staging.
2. Validasi setelah merge ke production, tempat kasus aslinya sudah ada.

Login aplikasi: `anggota@komcad.mil.id`, password demo ada di `app/prisma/seed.ts` (konstanta
`DEMO_PASSWORD`). Staging masih di balik proteksi SSO Vercel, jadi perlu login akun Vercel dulu
sebelum sampai ke halaman login aplikasi.

URL: buka `/m/profil` dan `/m/riwayat` (Sisi Anggota, bukan Command Center).

---

## A. QA-08, field terkunci di Profil

Buka `/m/profil`.

### A1. Empat field ini harus terlihat jelas terkunci

| Field | Ikon gembok | Catatan di bawahnya |
|---|---|---|
| Nama Lengkap | ada | Diatur oleh satuan. |
| Usia | ada | Dihitung dari tanggal lahir. |
| Unit / Satuan Asal | ada | Diatur oleh satuan. |
| Titik Lokasi Terkini | ada | Tidak bisa diketik manual. |

Yang dicek:

- Latar keempat field itu **lebih gelap** daripada field yang bisa diedit di sebelahnya (NIK,
  Golongan Darah, Pendidikan Terakhir, dan seterusnya). Bandingkan langsung Usia dengan Jenis
  Kelamin, keduanya sebaris.
- Ikon gembok kecil di sisi kanan dalam field.
- Catatan alasannya persis seperti tabel di atas. Alasannya sengaja beda-beda, jangan diharapkan
  seragam.
- Coba ketik di dalamnya. Tidak boleh ada karakter yang masuk.

Poin utama temuan ini: penandanya tidak boleh cuma soal terang atau redup. Kalau brightness layar
diturunkan atau dilihat di HP lain, gembok dan catatan tetap kebaca.

### A2. Tombol GPS masih jalan

Di bawah Titik Lokasi Terkini, tombol "Perbarui lokasi dari GPS perangkat" harus tetap berfungsi
dan mengisi field itu. Fieldnya terkunci untuk diketik, bukan untuk diperbarui.

### A3. Keyboard

Klik "Keluar" di header lalu tekan Tab berulang tanpa menyentuh mouse. Urutannya harus:

```
Nama Lengkap -> NIK -> Golongan Darah -> Jenis Kelamin -> Usia ->
Pendidikan Terakhir -> Pekerjaan Sipil -> Unit / Satuan Asal ->
Alamat Domisili -> Titik Lokasi Terkini -> tombol GPS -> ... -> Simpan Perubahan
```

Yang dicek: **keempat field terkunci ikut dilewati kursor Tab**. Sebelum perbaikan ini keempatnya
dilompati sama sekali, jadi pengguna keyboard dan pembaca layar tidak pernah sampai ke nilainya.

Sekalian: klik teks label "NIK". Kursor harus langsung pindah ke kotak NIK. Ini juga baru.

### A4. Menyimpan masih benar

1. Ubah "Pekerjaan Sipil" jadi teks lain.
2. Tekan "Simpan Perubahan". Harus muncul "Profil berhasil disimpan".
3. Refresh halaman.

Yang dicek: Pekerjaan Sipil tersimpan, sementara Nama Lengkap, Usia, dan Unit / Satuan Asal tidak
berubah sedikit pun. Kembalikan lagi nilai Pekerjaan Sipil setelah selesai.

---

## B. QA-10, pemisahan Riwayat Penugasan

Buka `/m/riwayat`, pilih tab **Penugasan**.

### B1. Bentuk tampilan yang benar

Isinya sekarang dibagi paling banyak dua bagian, dengan judul kecil huruf kapital:

```
MENUNGGU RESPONS
Konfirmasi atau tolak lewat Notifikasi.
  [kartu penugasan yang belum dijawab]

RIWAYAT
  [kartu penugasan yang sudah dikonfirmasi, ditolak, atau selesai]
```

Aturannya:

- Penugasan pada Misi berstatus **Draft tidak muncul sama sekali**, tidak di bagian mana pun.
- Bagian yang kosong tidak ditampilkan judulnya. Kalau tidak ada yang menunggu respons, judul
  "MENUNGGU RESPONS" tidak ikut tampil.
- Kalau dua-duanya kosong, yang muncul cuma satu baris "Belum ada riwayat penugasan.", bukan dua
  judul kosong.
- Kata "Notifikasi" di kalimat bawah judul bisa diklik dan membuka `/m/notifikasi`. Tombol
  Konfirmasi dan Tolak memang ada di sana, bukan di halaman Riwayat.

Kenapa Draft dihilangkan: penugasan untuk Misi Draft dibuat saat AI menyusun kandidat, sedangkan
notifikasi ke Anggota baru dikirim ketika Operator memobilisasi Misi. Jadi selama Misinya masih
Draft, Anggota melihat permintaan respons yang belum pernah dikirim dan tidak ada tombol untuk
menjawabnya. Selain itu daftar kandidat AI jadi kelihatan sebelum Operator memutuskan.

### B2. Warna badge

| Status kehadiran | Warna |
|---|---|
| Menunggu Respons | kuning (amber) |
| Dikonfirmasi | biru muda (cyan) |
| Ditolak | merah |
| Hadir, Selesai | hijau |

Sebelum perbaikan, "Menunggu Respons" dan "Dikonfirmasi" sama-sama tampil **merah**, beda dari
warna yang dipakai di Command Center untuk status yang sama. Kalau masih ada yang merah selain
"Ditolak", berarti belum kena perbaikannya.

Warna yang sama juga berlaku di tab Pelatihan dan Sertifikasi, silakan dilirik sekalian.

### B3. Status kehadiran tidak boleh hilang

Cari kartu penugasan pada Misi yang sudah **Selesai dan punya Hasil Evaluasi**.

Yang benar: badge tetap menampilkan status kehadiran Anggota itu sendiri, dan teks evaluasi Misi
ada di baris terpisah di bawahnya, diawali "Evaluasi misi:".

Yang salah (perilaku lama): begitu Misi punya evaluasi, status kehadiran hilang diganti teks
evaluasi. Akibatnya Anggota yang menolak penugasan tetap terbaca seolah ikut turun.

### B4. Angka di Beranda harus cocok

Buka `/m`. Kartu "Riwayat Penugasan" harus menampilkan **jumlah yang sama** dengan total kartu di
tab Penugasan tadi. Misi Draft tidak dihitung di dua-duanya.

---

## C. Yang akan terlihat berubah di production

Untuk akun demo Anggota (Ahmad Pratama), setelah merge ke `main`:

| Layar | Sebelum | Sesudah |
|---|---|---|
| Riwayat > Penugasan | 4 kartu, 3 di antaranya badge merah "Menunggu Respons" | 1 kartu, di bawah judul RIWAYAT: MISI-2026-024, badge cyan "Dikonfirmasi" |
| Beranda, kartu "Riwayat Penugasan" | 4 | 1 |
| Beranda, "Hari Sejak Tugas Terakhir" | tidak berubah, keempat penugasan dibuat di tanggal yang sama | sama |

Bagian "MENUNGGU RESPONS" tidak akan muncul untuk akun ini, karena satu-satunya penugasan pada
Misi yang sudah dimobilisasi sudah berstatus Dikonfirmasi. Itu perilaku yang benar, bukan bagian
yang gagal dirender.

Angka turun ini bukan data hilang. Sama seperti hitungan Misi Aktif yang turun waktu QA-06
diperbaiki. Di production ada 38 penugasan yang menempel pada Misi Draft, jadi Anggota lain juga
akan melihat daftarnya memendek.

---

## D. Yang tidak termasuk perbaikan ini

Supaya tidak dilaporkan ulang sebagai regresi:

- Lima kolom di bagian Kontak & Sosial Media (Telepon, Email, WhatsApp, Instagram, LinkedIn)
  masih mengandalkan placeholder dan ikon, belum punya label. Beda masalah dari QA-08, belum
  disentuh.
- QA-09 (Kontak Darurat dipecah jadi dua field) butuh perubahan struktur database dan pemindahan
  data di tiga database sekaligus, dikerjakan terpisah.
- QA-11 (perbandingan lintas waktu) dan QA-13 (cross-check skor AI dengan hasil misi) tertahan di
  datanya, bukan di tampilan. Tabel riwayat Readiness Score ada di skema tapi isinya nol baris dan
  tidak ada satu pun kode yang menulisinya, dan kolom hasil evaluasi per personel masih kosong di
  seluruh 141 baris penugasan di production. Keduanya perlu keputusan dulu, bukan langsung
  dikerjakan.
- QA-12 (kolom catatan untuk Analis) belum dikerjakan.

---

## E. Kalau ada yang tidak cocok

Yang berguna dilampirkan waktu melapor:

1. Lingkungan yang dipakai (staging atau production) dan akun yang dipakai login.
2. Kode Misi yang terlibat, misalnya MISI-2026-025.
3. Screenshot yang memuat badge dan judul bagiannya sekalian, bukan kartunya saja.

Berkas yang diubah, kalau perlu ditelusuri:

```
app/src/components/m-shell/profil-view.tsx     QA-08
app/src/components/m-shell/riwayat-view.tsx    QA-10
app/src/lib/anggota-mobile-data.ts             hitungan di Beranda
```
