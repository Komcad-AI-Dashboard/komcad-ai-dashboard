-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "anggotaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anggota" (
    "id" TEXT NOT NULL,
    "kodeAnggota" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nikHash" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "unitAsal" TEXT NOT NULL,
    "statusKeanggotaan" TEXT NOT NULL DEFAULT 'Aktif',
    "statusSiaga" TEXT NOT NULL DEFAULT 'Siaga',
    "telepon" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "kontakDarurat" TEXT,
    "readinessScore" INTEGER NOT NULL DEFAULT 0,
    "readinessUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilDemografi" (
    "id" TEXT NOT NULL,
    "anggotaId" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" TEXT NOT NULL,
    "pendidikan" TEXT,
    "pekerjaanSipil" TEXT,
    "golonganDarah" TEXT,
    "alamatDomisili" TEXT,
    "provinsi" TEXT,
    "kabupatenKota" TEXT,

    CONSTRAINT "ProfilDemografi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lokasi" (
    "id" TEXT NOT NULL,
    "anggotaId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kabupatenKota" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lokasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sertifikasi" (
    "id" TEXT NOT NULL,
    "anggotaId" TEXT NOT NULL,
    "jenisSertifikasi" TEXT NOT NULL,
    "tanggalTerbit" TIMESTAMP(3) NOT NULL,
    "tanggalBerlaku" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Aktif',

    CONSTRAINT "Sertifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pelatihan" (
    "id" TEXT NOT NULL,
    "anggotaId" TEXT NOT NULL,
    "namaPelatihan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "sertifikatUrl" TEXT,
    "statusKelulusan" TEXT NOT NULL DEFAULT 'Lulus',

    CONSTRAINT "Pelatihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AktivitasPelatihan" (
    "id" TEXT NOT NULL,
    "namaPelatihan" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jumlahPeserta" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AktivitasPelatihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AktivitasPelatihanPeserta" (
    "id" TEXT NOT NULL,
    "aktivitasPelatihanId" TEXT NOT NULL,
    "anggotaId" TEXT NOT NULL,

    CONSTRAINT "AktivitasPelatihanPeserta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Misi" (
    "id" TEXT NOT NULL,
    "kodeMisi" TEXT NOT NULL,
    "pemberiPerintah" TEXT NOT NULL,
    "jenisKejadian" TEXT NOT NULL,
    "urgensi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "deskripsiMisi" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "kebutuhanPersonel" INTEGER DEFAULT 1,
    "ringkasanAI" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dimobilisasiAt" TIMESTAMP(3),
    "selesaiAt" TIMESTAMP(3),
    "hasilEvaluasi" TEXT,

    CONSTRAINT "Misi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penugasan" (
    "id" TEXT NOT NULL,
    "misiId" TEXT NOT NULL,
    "anggotaId" TEXT NOT NULL,
    "skorRekomendasi" INTEGER NOT NULL,
    "alasan" TEXT NOT NULL,
    "etaMenit" INTEGER,
    "statusKehadiran" TEXT NOT NULL DEFAULT 'Menunggu Respons',
    "hasilEvaluasi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penugasan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadinessScoreHistory" (
    "id" TEXT NOT NULL,
    "anggotaId" TEXT NOT NULL,
    "skor" INTEGER NOT NULL,
    "komponen" TEXT NOT NULL,
    "dihitungPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadinessScoreHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifikasi" (
    "id" TEXT NOT NULL,
    "anggotaId" TEXT NOT NULL,
    "misiId" TEXT,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'Aplikasi',
    "status" TEXT NOT NULL DEFAULT 'Terkirim',
    "deliveryAttempts" INTEGER NOT NULL DEFAULT 1,
    "responsTipe" TEXT,
    "responsAlasan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermintaanUbahData" (
    "id" TEXT NOT NULL,
    "anggotaId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "nilaiLama" TEXT NOT NULL,
    "nilaiBaru" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "alasanTolak" TEXT,
    "diprosesOlehId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diprosesPada" TIMESTAMP(3),

    CONSTRAINT "PermintaanUbahData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengaturanSistem" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "notifMisiBaru" BOOLEAN NOT NULL DEFAULT true,
    "reminderSertifikasi" BOOLEAN NOT NULL DEFAULT true,
    "fallbackSms" BOOLEAN NOT NULL DEFAULT false,
    "petaHeatzone" BOOLEAN NOT NULL DEFAULT false,
    "petaAutoRefresh" BOOLEAN NOT NULL DEFAULT true,
    "aiRadiusKm" INTEGER NOT NULL DEFAULT 25,
    "aiBobotReadiness" INTEGER NOT NULL DEFAULT 40,
    "aiBobotJarak" INTEGER NOT NULL DEFAULT 35,
    "aiBobotKompetensi" INTEGER NOT NULL DEFAULT 25,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PengaturanSistem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "aksi" TEXT NOT NULL,
    "entitas" TEXT NOT NULL,
    "entitasId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_anggotaId_key" ON "User"("anggotaId");

-- CreateIndex
CREATE UNIQUE INDEX "Anggota_kodeAnggota_key" ON "Anggota"("kodeAnggota");

-- CreateIndex
CREATE UNIQUE INDEX "Anggota_nikHash_key" ON "Anggota"("nikHash");

-- CreateIndex
CREATE INDEX "Anggota_statusSiaga_idx" ON "Anggota"("statusSiaga");

-- CreateIndex
CREATE INDEX "Anggota_unitAsal_idx" ON "Anggota"("unitAsal");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilDemografi_anggotaId_key" ON "ProfilDemografi"("anggotaId");

-- CreateIndex
CREATE INDEX "Lokasi_anggotaId_recordedAt_idx" ON "Lokasi"("anggotaId", "recordedAt");

-- CreateIndex
CREATE INDEX "Sertifikasi_anggotaId_idx" ON "Sertifikasi"("anggotaId");

-- CreateIndex
CREATE INDEX "Sertifikasi_status_idx" ON "Sertifikasi"("status");

-- CreateIndex
CREATE INDEX "Pelatihan_anggotaId_idx" ON "Pelatihan"("anggotaId");

-- CreateIndex
CREATE INDEX "AktivitasPelatihan_tanggal_idx" ON "AktivitasPelatihan"("tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "AktivitasPelatihanPeserta_aktivitasPelatihanId_anggotaId_key" ON "AktivitasPelatihanPeserta"("aktivitasPelatihanId", "anggotaId");

-- CreateIndex
CREATE UNIQUE INDEX "Misi_kodeMisi_key" ON "Misi"("kodeMisi");

-- CreateIndex
CREATE INDEX "Misi_status_idx" ON "Misi"("status");

-- CreateIndex
CREATE INDEX "Misi_urgensi_idx" ON "Misi"("urgensi");

-- CreateIndex
CREATE INDEX "Penugasan_misiId_idx" ON "Penugasan"("misiId");

-- CreateIndex
CREATE INDEX "Penugasan_anggotaId_idx" ON "Penugasan"("anggotaId");

-- CreateIndex
CREATE UNIQUE INDEX "Penugasan_misiId_anggotaId_key" ON "Penugasan"("misiId", "anggotaId");

-- CreateIndex
CREATE INDEX "ReadinessScoreHistory_anggotaId_dihitungPada_idx" ON "ReadinessScoreHistory"("anggotaId", "dihitungPada");

-- CreateIndex
CREATE INDEX "Notifikasi_anggotaId_status_idx" ON "Notifikasi"("anggotaId", "status");

-- CreateIndex
CREATE INDEX "PermintaanUbahData_anggotaId_status_idx" ON "PermintaanUbahData"("anggotaId", "status");

-- CreateIndex
CREATE INDEX "AuditLog_entitas_entitasId_idx" ON "AuditLog"("entitas", "entitasId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilDemografi" ADD CONSTRAINT "ProfilDemografi_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lokasi" ADD CONSTRAINT "Lokasi_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sertifikasi" ADD CONSTRAINT "Sertifikasi_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pelatihan" ADD CONSTRAINT "Pelatihan_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AktivitasPelatihanPeserta" ADD CONSTRAINT "AktivitasPelatihanPeserta_aktivitasPelatihanId_fkey" FOREIGN KEY ("aktivitasPelatihanId") REFERENCES "AktivitasPelatihan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AktivitasPelatihanPeserta" ADD CONSTRAINT "AktivitasPelatihanPeserta_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penugasan" ADD CONSTRAINT "Penugasan_misiId_fkey" FOREIGN KEY ("misiId") REFERENCES "Misi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penugasan" ADD CONSTRAINT "Penugasan_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadinessScoreHistory" ADD CONSTRAINT "ReadinessScoreHistory_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_misiId_fkey" FOREIGN KEY ("misiId") REFERENCES "Misi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermintaanUbahData" ADD CONSTRAINT "PermintaanUbahData_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermintaanUbahData" ADD CONSTRAINT "PermintaanUbahData_diprosesOlehId_fkey" FOREIGN KEY ("diprosesOlehId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
