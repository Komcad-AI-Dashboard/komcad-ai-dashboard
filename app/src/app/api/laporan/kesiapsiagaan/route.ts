import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { generateLaporanKesiapsiagaanPdf } from "@/lib/laporan";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.ANALIS) {
    return new Response("Hanya Analis/Evaluator dan Super Admin yang dapat mengunduh laporan.", { status: 403 });
  }

  const pdf = await generateLaporanKesiapsiagaanPdf();
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="laporan-kesiapsiagaan-nasional.pdf"',
    },
  });
}
