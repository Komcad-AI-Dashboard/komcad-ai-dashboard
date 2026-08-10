# 10. Panduan UI/UX — Command Center (Full Dark Mode, Sinkron dengan Mockup)

Bab ini menggantikan panduan UI/UX v1.0 dan mendeskripsikan **persis** apa yang telah diimplementasikan pada mockup interaktif (`komcad-dashboard.html`), sehingga dapat langsung dipakai tim desain/engineering sebagai spesifikasi final tanpa penerjemahan ulang.

## 10.1 Identitas Visual
- Nama produk: **AI KOMCAD** (brand text di sidebar & footer), sebelumnya "Komcad Digital Platform".
- Logo: kotak dua warna merah-putih (bendera Indonesia) berukuran 28×22px dengan sudut membulat halus (3px), ditempatkan di kiri atas sidebar bersanding dengan wordmark "AI KOMCAD" dan subteks "COMMAND CENTER".
- Judul tab browser: "AI KOMCAD".

## 10.2 Palet Warna (Full Black Dark Mode)

| Token | Hex | Penggunaan |
|---|---|---|
| Background Primary | `#000000` | Latar belakang utama seluruh aplikasi — hitam murni, bukan abu-abu gelap |
| Background Surface | `#060809` | Panel, card, tabel |
| Background Elevated | `#0E1215` | Input, dropdown, tombol sekunder, modal |
| Background Hover | `#171C20` | State hover baris tabel & item sidebar |
| Border / Hairline | `#22282D` | Garis pembatas tipis antar-elemen |
| Text Primary | `#EDF1F4` | Teks utama, angka KPI, judul |
| Text Secondary | `#8B96A0` | Label, caption, metadata |
| Text Dim | `#565F67` | Teks non-esensial (timestamp, hint) |
| Accent / Accent Bright (Tactical Green) | `#22C577` / `#3CF29A` | Aksen brand utama — status siap, tombol utama, highlight interaktif, readiness |
| Amber (Warning) | `#E0A83E` | Status siaga, peringatan non-kritis, sertifikasi akan kedaluwarsa |
| Red (Critical) | `#E14C45` | Status kritis, Misi darurat, sertifikasi kedaluwarsa, badge alert |
| Cyan (AI / Data Layer) | `#3FA9C9` | Elemen terkait AI (ringkasan AI, badge "NASIONAL" pada panel statistik) |
| Gold | `#B08D4F` | Pos Komando pada peta, elemen berjenjang/otoritas |

## 10.3 Tipografi
- Font utama: Inter / IBM Plex Sans / system-ui — sans-serif teknis untuk keterbacaan tinggi di dark mode.
- Font data/angka: IBM Plex Mono / JetBrains Mono — dipakai untuk ID Misi, koordinat, jam, dan nilai numerik KPI agar terasa presisi seperti instrumen.
- Label section & badge status memakai huruf kapital dengan letter-spacing lebar (mis. "MISI AKTIF", "LIVE", "NASIONAL").

## 10.4 Struktur Layout

### Sidebar (236px, dapat disembunyikan)
- Berisi 5 grup navigasi sesuai [10-struktur-navigasi.md](10-struktur-navigasi.md): RINGKASAN, OPERASI, DATA ANGGOTA, LAPORAN, ASISTEN, SISTEM.
- Ikon ☰ di topbar men-toggle lebar sidebar dari 236px menjadi 0px dengan transisi halus (width & opacity, 180ms) — bukan sekadar disembunyikan tiba-tiba.
- Item menu aktif ditandai latar hijau transparan (rgba accent-bright 10%) dan teks berwarna accent-bright.

### Topbar (52px)
Berisi (kiri ke kanan): tombol toggle sidebar → judul halaman + breadcrumb → indikator LIVE berdenyut → *(kanan)* pemilih wilayah → tombol **BUAT MISI** → chip Readiness nasional → tombol **MISI AKTIF** (badge merah) → kolom pencarian → ikon pengaturan → tombol Masuk.

### Overview — Peta & Panel Bawah
- Peta situasi (OpenStreetMap + filter tactical dark) mengisi area utama, dilengkapi panel Layers (kiri atas), panel Aktivitas Pelatihan Terbaru (kanan atas), legenda (bawah tengah), dan ikon mode layar penuh.
- Tiga panel bawah dengan **urutan tetap**: 1) Statistik Anggota, 2) Misi Terbaru, 3) AI Mobilization — masing-masing dapat disembunyikan individual (tombol "−") maupun sekaligus (tombol "Sembunyikan Semua Panel" di situation bar).
- Panel yang disembunyikan direpresentasikan sebagai chip "+ Nama Panel" pada bilah tipis di atas baris panel, untuk dimunculkan kembali kapan saja.

## 10.5 Peta Situasi — Spesifikasi Teknis
- Basemap: OpenStreetMap standar (`tile.openstreetmap.org`), diberi filter CSS (invert + hue-rotate + brightness + saturate) sehingga tampil gelap/tactical tanpa mengganti penyedia peta.
- Batas wilayah: peta dibatasi (`maxBounds`) pada bounding box Indonesia (±93,5°BT–141,5°BT, -11,5°LS–7°LU) sehingga pengguna tidak bisa menggeser ke luar Indonesia.
- Mode layar penuh: klik ikon ⛶ membuat peta menutupi seluruh viewport (position fixed, z-index tertinggi) termasuk overlay Layers, Aktivitas Pelatihan, dan legenda tetap tampil; klik ✕ untuk kembali ke tata letak normal.
- Marker: anggota siap (hijau accent-bright), anggota siaga (amber), zona Misi (lingkaran radius sesuai urgensi: merah=Kritis, amber=Tinggi, cyan=Sedang), pos komando (ikon belah ketupat emas).

## 10.6 Komponen Kunci

### Profil CV Anggota (Drawer)
- Header profil: foto (kotak 72×72px, sudut membulat; placeholder berupa ikon siluet orang generik dengan keterangan kecil "Foto belum tersedia" hingga foto asli diunggah), nama, ID, unit, badge status, badge Readiness.
- Baris sosial media: tombol WhatsApp (tautan wa.me), Email (tautan mailto), Instagram, LinkedIn — masing-masing dapat diklik.
- Kartu berurutan: Kompetensi & Spesialisasi (chip), Data Pribadi (grid dua kolom), Sertifikasi, Riwayat Pelatihan, Riwayat Penugasan Terakhir.

### Panel Statistik Anggota
- Bar komposisi gender dua warna (cyan=laki-laki, pink=perempuan) dengan label persentase & jumlah absolut.
- Dua kartu mini: Total anggota terdaftar, jumlah berstatus aktif.
- Daftar provinsi terbanyak sebagai bar horizontal terurut menurun.

### Panel Aktivitas Pelatihan Terbaru
- Daftar item dengan nama pelatihan, lokasi (ikon pin), tanggal (font mono), dan jumlah peserta (warna amber) — dapat discroll dan diklik per item.

### Modal "Buat Misi"
- Form: Pemberi Perintah, Jenis Kejadian + Urgensi (dua kolom sejajar), Lokasi, Deskripsi Misi (textarea).
- State loading: spinner berputar + teks "AI Mobilization sedang menganalisis Big Data anggota...".
- State hasil: ringkasan AI (kartu aksen cyan) yang mengutip Pemberi Perintah & Deskripsi Misi, daftar kandidat (kartu skor + alasan + ETA), tombol "Setujui & Kirim Notifikasi".
- State konfirmasi: ikon centang besar, ID Misi baru, jumlah kandidat dinotifikasi, tombol "Selesai" menutup modal.

### Halaman AI Chat
- Bubble percakapan kiri (AI, avatar ✦ dengan latar hijau transparan) dan kanan (pengguna, avatar 👤); jawaban AI dapat memuat tabel mini atau bar mini di dalam bubble.
- Indikator "mengetik" (tiga titik berdenyut) tampil ±700ms sebelum jawaban muncul, mensimulasikan proses AI.
- Chip pertanyaan cepat di atas kolom input untuk mempercepat eksplorasi pertama kali.

### Halaman Guideline
- Tiga tab (Panduan Pengguna / FAQ / Modul) beralih tanpa reload; tab Modul menampilkan kartu per modul dengan judul, badge status (Aktif/Beta), paragraf deskripsi fungsi (minimal 3 kalimat), dan chip fitur utama.

## 10.7 Ikonografi & Motion
- Ikon garis tipis (outline, stroke ±1.5px), selaras gaya Lucide/Feather.
- Elemen live (indikator LIVE, dot berdenyut) memakai animasi pulse halus 1,8 detik.
- Transisi sidebar & panel: 150–220ms, easing ease/ease-out — tegas dan cepat, bukan bouncy.

## 10.8 Aksesibilitas
- Kontras teks terhadap Background Primary (`#000000`) memenuhi WCAG AA meski dark mode penuh.
- Status tidak hanya dibedakan lewat warna — badge selalu menyertakan label teks (mis. "Aktif", "Kedaluwarsa").
- Semua elemen interaktif (checkbox layer, toggle panel, tombol modal) memiliki target klik minimal 30×30px.

---
⬅ [Sebelumnya](05-data-requirements.md) | [Daftar Isi](00-README.md) | ➡ [Data Dummy](09-data-dummy.md)
