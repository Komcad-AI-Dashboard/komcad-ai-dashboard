// Modul Laporan & Ekspor (FR-27) — generator PDF/XLSX SUNGGUHAN dari data Prisma (bukan file dummy
// statis). Server-only.

import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { PRODUK_KEPANJANGAN, PRODUK_NAMA, STATUS_MISI } from "@/lib/constants";
import { getAnalitikKpi, getReadinessPerWilayah } from "@/lib/analitik-data";

function pdfToBuffer(build: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 44, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    build(doc);
    doc.end();
  });
}

function pdfHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
  // Laporan dibaca pihak di luar sistem, jadi nama produk selalu ditulis lengkap dengan
  // kepanjangannya — pembaca dokumen belum tentu kenal akronimnya.
  doc.fontSize(16).text(PRODUK_NAMA, { align: "left" });
  doc
    .fontSize(9)
    .fillColor("#666666")
    .text(`${PRODUK_KEPANJANGAN} — Command Center Komponen Cadangan`);
  doc.fillColor("#000000");
  doc.moveDown(0.2);
  doc.fontSize(20).text(title);
  doc.fontSize(10).fillColor("#666666").text(subtitle);
  doc.fillColor("#000000");
  doc.moveDown(1);
  doc
    .moveTo(doc.x, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor("#cccccc")
    .stroke();
  doc.moveDown(1);
}

// Warna cetak, bukan warna layar. Palet UI dibangun untuk latar hitam; di atas kertas putih
// track gelapnya jadi blok pekat dan tulisannya tenggelam.
const PDF_BAR_FILL = "#22C577";
const PDF_BAR_TRACK = "#EAEEF0";
const PDF_RULE = "#D5DBDF";
const PDF_MUTED = "#666666";

/** doc.text() otomatis menambah halaman kalau meluber; doc.rect()/doc.moveTo() TIDAK — keduanya
 * akan menggambar terus melewati batas bawah, keluar halaman, tanpa error sama sekali. Semua bar
 * dan garis di bawah digambar manual, jadi tiap baris wajib memeriksa sisa ruang lebih dulu. */
function ensureSpace(doc: PDFKit.PDFDocument, needed: number, onNewPage?: () => void) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    onNewPage?.();
  }
}

function contentWidth(doc: PDFKit.PDFDocument) {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

/** Tabel dua kolom (label, nilai) untuk ringkasan angka. Menggantikan deretan doc.text() lepas
 * yang tidak punya perataan sama sekali. */
function pdfKeyValueTable(doc: PDFKit.PDFDocument, rows: { label: string; value: string }[]) {
  const x = doc.page.margins.left;
  const w = contentWidth(doc);
  const valueW = 180;
  const labelW = w - valueW;
  const rowH = 18;

  for (const r of rows) {
    ensureSpace(doc, rowH);
    const y = doc.y;
    doc
      .moveTo(x, y + rowH)
      .lineTo(x + w, y + rowH)
      .strokeColor(PDF_RULE)
      .lineWidth(0.5)
      .stroke();
    doc.fontSize(9.5).fillColor(PDF_MUTED).text(r.label, x + 2, y + 5, { width: labelW, lineBreak: false });
    doc
      .fontSize(9.5)
      .fillColor("#000000")
      .text(r.value, x + labelW, y + 5, { width: valueW - 2, align: "right", lineBreak: false });
    // doc.y digeser manual: menggambar teks di koordinat eksplisit tidak memajukan kursor
    // seperti doc.text() biasa, jadi tanpa ini semua baris menumpuk di tempat yang sama.
    doc.y = y + rowH;
  }
  // doc.x WAJIB dikembalikan ke margin kiri. Menulis teks di koordinat eksplisit meninggalkan
  // doc.x di posisi terakhir, dan doc.text() berikutnya memakainya sebagai tepi kiri — judul
  // sesudah tabel ini sempat tercetak menjempol ke kanan halaman karenanya.
  doc.x = doc.page.margins.left;
  doc.fillColor("#000000");
}

/** Bar horizontal per wilayah, diurutkan sesuai data yang masuk (FR-26). Tiap baris membawa
 * angkanya sendiri — nama, bar, skor, jumlah anggota — jadi ini sekaligus tabel dan diagram,
 * bukan dua blok berisi data yang sama. Tata letaknya mengikuti grafik di layar Analitik
 * (app/(command)/analitik/page.tsx) supaya laporan dan dashboard tidak berbeda bahasa visual.
 *
 * `score` diasumsikan 0-100 (Readiness Score memang begitu), jadi lebar bar = skor% dari track. */
function pdfBarChart(
  doc: PDFKit.PDFDocument,
  rows: { label: string; score: number; note: string }[],
  opts: { average?: number | null; averageLabel?: string; onPageBreak?: () => void } = {}
) {
  const x = doc.page.margins.left;
  const w = contentWidth(doc);
  const rowH = 18;
  const barH = 7;
  const labelW = 130;
  const scoreW = 26;
  const noteW = 96;
  const trackX = x + labelW + 8;
  const trackW = w - labelW - 8 - scoreW - noteW - 16;

  const avg = opts.average ?? null;
  const avgX = avg !== null ? trackX + (Math.min(100, Math.max(0, avg)) / 100) * trackW : null;

  function drawAverageRule(topY: number, bottomY: number) {
    if (avgX === null || bottomY <= topY) return;
    doc.save();
    doc.dash(2, { space: 2 });
    doc.moveTo(avgX, topY).lineTo(avgX, bottomY).strokeColor("#8B96A0").lineWidth(0.7).stroke();
    doc.undash();
    doc.restore();
  }

  // Garis rata-rata digambar per SEGMEN halaman, bukan sekali di akhir. Kalau digambar sekali
  // saja, bar yang lanjut ke halaman berikutnya kehilangan garisnya dan segmen terakhirlah yang
  // dapat — dan koordinat Y dari halaman sebelumnya tidak bisa dipakai lagi setelah addPage().
  let blockTop = doc.y;
  for (const r of rows) {
    if (doc.y + rowH > doc.page.height - doc.page.margins.bottom) {
      drawAverageRule(blockTop, doc.y);
      doc.addPage();
      opts.onPageBreak?.();
      blockTop = doc.y;
    }
    const y = doc.y;
    const pct = Math.min(100, Math.max(0, r.score)) / 100;

    doc.fontSize(9).fillColor("#000000").text(r.label, x, y + 4, { width: labelW, lineBreak: false });
    doc.rect(trackX, y + (rowH - barH) / 2, trackW, barH).fill(PDF_BAR_TRACK);
    if (pct > 0) doc.rect(trackX, y + (rowH - barH) / 2, trackW * pct, barH).fill(PDF_BAR_FILL);
    doc
      .fontSize(9)
      .fillColor("#000000")
      .text(String(r.score), trackX + trackW + 8, y + 4, { width: scoreW, align: "right", lineBreak: false });
    doc
      .fontSize(8.5)
      .fillColor(PDF_MUTED)
      .text(r.note, trackX + trackW + 8 + scoreW + 8, y + 4, { width: noteW, align: "right", lineBreak: false });

    doc.y = y + rowH;
  }

  drawAverageRule(blockTop, doc.y);

  if (avg !== null && opts.averageLabel) {
    ensureSpace(doc, 16);
    doc.moveDown(0.3);
    doc.fontSize(8).fillColor(PDF_MUTED).text(opts.averageLabel, x, doc.y, { width: w, lineBreak: false });
    doc.y += 10;
  }
  doc.x = doc.page.margins.left; // lihat catatan yang sama di pdfKeyValueTable
  doc.fillColor("#000000");
}

export async function generateLaporanKesiapsiagaanPdf(): Promise<Buffer> {
  const [kpi, wilayah] = await Promise.all([getAnalitikKpi(), getReadinessPerWilayah()]);
  const now = new Date();

  return pdfToBuffer((doc) => {
    pdfHeader(
      doc,
      "Laporan Kesiapsiagaan Nasional",
      `Dibuat ${now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })} pukul ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} WIB`
    );

    doc.fontSize(12).fillColor("#000000").text("Ringkasan KPI Nasional", { underline: true });
    doc.moveDown(0.5);
    pdfKeyValueTable(doc, [
      { label: "Readiness Score Nasional", value: String(kpi.readinessNasional) },
      { label: "Misi Selesai (30 hari terakhir)", value: String(kpi.misiSelesai30Hari) },
      { label: "Sertifikasi Kedaluwarsa", value: String(kpi.sertifikasiKedaluwarsa) },
      {
        label: "AI Mobilization Uptime",
        value:
          kpi.aiUptimePersen === null
            ? "belum ada data"
            : `${kpi.aiUptimePersen}% dari ${kpi.totalGenerateAi} kali generate`,
      },
    ]);
    doc.moveDown(1.2);

    // Judul diulang tiap halaman lewat renderJudulWilayah() supaya bar yang lanjut ke halaman
    // berikutnya tidak muncul sebagai deretan batang tanpa keterangan.
    const renderJudulWilayah = () => {
      doc.fontSize(12).fillColor("#000000").text("Readiness Score per Wilayah", { underline: true });
      doc.moveDown(0.5);
    };
    renderJudulWilayah();

    if (wilayah.length === 0) {
      // Dipertahankan apa adanya: tanpa data, kerangka diagram kosong lebih membingungkan
      // daripada satu kalimat yang menyebutkan datanya memang belum ada.
      doc.fontSize(10).text("Belum ada data provinsi anggota.");
      return;
    }

    pdfBarChart(
      doc,
      wilayah.map((w) => ({
        label: w.provinsi,
        score: w.score,
        note: `${w.jumlahAnggota} anggota`,
      })),
      {
        average: kpi.readinessNasional,
        averageLabel: `Garis putus-putus = rata-rata nasional (${kpi.readinessNasional}). Wilayah di kirinya berada di bawah rata-rata.`,
        onPageBreak: renderJudulWilayah,
      }
    );
  });
}

export async function generateRekapMobilisasiXlsx(): Promise<Buffer> {
  const misi = await prisma.misi.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { penugasan: true } } },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = `${PRODUK_NAMA} — ${PRODUK_KEPANJANGAN}`;
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Rekap Mobilisasi");

  sheet.columns = [
    { header: "ID Misi", key: "kodeMisi", width: 18 },
    { header: "Jenis Kejadian", key: "jenisKejadian", width: 20 },
    { header: "Lokasi", key: "lokasi", width: 28 },
    { header: "Urgensi", key: "urgensi", width: 12 },
    { header: "Status", key: "status", width: 16 },
    { header: "Personel", key: "personel", width: 10 },
    { header: "Dibuat", key: "createdAt", width: 18 },
    { header: "Dimobilisasi", key: "dimobilisasiAt", width: 18 },
    { header: "Selesai", key: "selesaiAt", width: 18 },
    { header: "Hasil Evaluasi", key: "hasilEvaluasi", width: 40 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const m of misi) {
    sheet.addRow({
      kodeMisi: m.kodeMisi,
      jenisKejadian: m.jenisKejadian,
      lokasi: m.lokasi,
      urgensi: m.urgensi,
      status: m.status,
      personel: m._count.penugasan,
      createdAt: m.createdAt.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" }),
      dimobilisasiAt: m.dimobilisasiAt?.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" }) ?? "",
      selesaiAt: m.selesaiAt?.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" }) ?? "",
      hasilEvaluasi: m.hasilEvaluasi ?? "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generateEvaluasiAiPdf(): Promise<Buffer> {
  const misiSelesai = await prisma.misi.findMany({
    where: { status: STATUS_MISI.SELESAI },
    orderBy: { selesaiAt: "desc" },
    include: { penugasan: true },
  });
  const now = new Date();

  return pdfToBuffer((doc) => {
    pdfHeader(
      doc,
      "Evaluasi AI Mobilization",
      `Rekap Misi selesai & rata-rata skor rekomendasi AI — dibuat ${now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })}`
    );

    doc.fontSize(10);
    if (misiSelesai.length === 0) {
      doc.text("Belum ada Misi yang selesai untuk dievaluasi.");
    }
    for (const m of misiSelesai) {
      const skorRata =
        m.penugasan.length > 0
          ? Math.round(m.penugasan.reduce((sum, p) => sum + p.skorRekomendasi, 0) / m.penugasan.length)
          : null;
      doc.font("Helvetica-Bold").text(`${m.kodeMisi} — ${m.jenisKejadian}, ${m.lokasi}`);
      doc.font("Helvetica");
      doc.text(
        `Selesai: ${m.selesaiAt?.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" }) ?? "-"}  ·  Personel: ${m.penugasan.length}  ·  Rata-rata skor rekomendasi AI: ${skorRata ?? "-"}`
      );
      doc.text(`Evaluasi: ${m.hasilEvaluasi ?? "-"}`);
      doc.moveDown(0.8);
    }
  });
}

export async function generateLaporanWilayahXlsx(provinsi: string): Promise<Buffer> {
  const anggota = await prisma.anggota.findMany({
    where: { profilDemografi: { provinsi } },
    include: { profilDemografi: true },
    orderBy: { nama: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(`Anggota - ${provinsi}`.slice(0, 31));
  sheet.columns = [
    { header: "Kode Anggota", key: "kodeAnggota", width: 16 },
    { header: "Nama", key: "nama", width: 26 },
    { header: "Unit Asal", key: "unitAsal", width: 24 },
    { header: "Kab/Kota", key: "kabupatenKota", width: 20 },
    { header: "Status Siaga", key: "statusSiaga", width: 16 },
    { header: "Readiness Score", key: "readinessScore", width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };
  for (const a of anggota) {
    sheet.addRow({
      kodeAnggota: a.kodeAnggota,
      nama: a.nama,
      unitAsal: a.unitAsal,
      kabupatenKota: a.profilDemografi?.kabupatenKota ?? "",
      statusSiaga: a.statusSiaga,
      readinessScore: a.readinessScore,
    });
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function generateLaporanMisiXlsx(misiId: string): Promise<Buffer | null> {
  const misi = await prisma.misi.findUnique({
    where: { id: misiId },
    include: { penugasan: { include: { anggota: true }, orderBy: { skorRekomendasi: "desc" } } },
  });
  if (!misi) return null;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(misi.kodeMisi);
  sheet.addRow(["ID Misi", misi.kodeMisi]);
  sheet.addRow(["Jenis Kejadian", misi.jenisKejadian]);
  sheet.addRow(["Lokasi", misi.lokasi]);
  sheet.addRow(["Status", misi.status]);
  sheet.addRow(["Urgensi", misi.urgensi]);
  sheet.addRow([]);
  const headerRow = sheet.addRow(["Kode Anggota", "Nama", "Skor Rekomendasi", "ETA (menit)", "Status Kehadiran"]);
  headerRow.font = { bold: true };
  for (const p of misi.penugasan) {
    sheet.addRow([p.anggota.kodeAnggota, p.anggota.nama, p.skorRekomendasi, p.etaMenit ?? "", p.statusKehadiran]);
  }
  sheet.columns.forEach((col) => (col.width = 22));
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function getLaporanFilterOptions() {
  const [provinsiGroups, misiList] = await Promise.all([
    prisma.profilDemografi.groupBy({ by: ["provinsi"], where: { provinsi: { not: null } } }),
    prisma.misi.findMany({ select: { id: true, kodeMisi: true, jenisKejadian: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return {
    provinsi: provinsiGroups.map((p) => p.provinsi as string).sort(),
    misi: misiList.map((m) => ({ id: m.id, label: `${m.kodeMisi} — ${m.jenisKejadian}` })),
  };
}

export async function generateLaporanPeriodeXlsx(dari: Date, sampai: Date): Promise<Buffer> {
  const misi = await prisma.misi.findMany({
    where: { createdAt: { gte: dari, lte: sampai } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { penugasan: true } } },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Misi per Periode");
  sheet.columns = [
    { header: "ID Misi", key: "kodeMisi", width: 18 },
    { header: "Jenis Kejadian", key: "jenisKejadian", width: 20 },
    { header: "Lokasi", key: "lokasi", width: 28 },
    { header: "Status", key: "status", width: 16 },
    { header: "Personel", key: "personel", width: 10 },
    { header: "Dibuat", key: "createdAt", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };
  for (const m of misi) {
    sheet.addRow({
      kodeMisi: m.kodeMisi,
      jenisKejadian: m.jenisKejadian,
      lokasi: m.lokasi,
      status: m.status,
      personel: m._count.penugasan,
      createdAt: m.createdAt.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" }),
    });
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
