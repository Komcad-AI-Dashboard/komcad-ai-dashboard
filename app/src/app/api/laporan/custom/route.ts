import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { generateLaporanWilayahXlsx, generateLaporanMisiXlsx, generateLaporanPeriodeXlsx } from "@/lib/laporan";

export async function GET(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.ANALIS) {
    return new Response("Hanya Analis/Evaluator dan Super Admin yang dapat mengunduh laporan.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tipe = searchParams.get("tipe");

  if (tipe === "wilayah") {
    const provinsi = searchParams.get("provinsi");
    if (!provinsi) return new Response("Parameter provinsi wajib diisi.", { status: 400 });
    const xlsx = await generateLaporanWilayahXlsx(provinsi);
    return new Response(new Uint8Array(xlsx), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="laporan-wilayah-${provinsi.replace(/\s+/g, "-").toLowerCase()}.xlsx"`,
      },
    });
  }

  if (tipe === "misi") {
    const misiId = searchParams.get("misiId");
    if (!misiId) return new Response("Parameter misiId wajib diisi.", { status: 400 });
    const xlsx = await generateLaporanMisiXlsx(misiId);
    if (!xlsx) return new Response("Misi tidak ditemukan.", { status: 404 });
    return new Response(new Uint8Array(xlsx), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="laporan-misi.xlsx"',
      },
    });
  }

  if (tipe === "periode") {
    const dari = searchParams.get("dari");
    const sampai = searchParams.get("sampai");
    if (!dari || !sampai) return new Response("Parameter dari & sampai wajib diisi.", { status: 400 });
    const dariDate = new Date(dari);
    const sampaiDate = new Date(`${sampai}T23:59:59`);
    if (Number.isNaN(dariDate.getTime()) || Number.isNaN(sampaiDate.getTime())) {
      return new Response("Format tanggal tidak valid.", { status: 400 });
    }
    const xlsx = await generateLaporanPeriodeXlsx(dariDate, sampaiDate);
    return new Response(new Uint8Array(xlsx), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="laporan-periode-${dari}-${sampai}.xlsx"`,
      },
    });
  }

  return new Response("Parameter tipe tidak dikenali (wilayah/misi/periode).", { status: 400 });
}
