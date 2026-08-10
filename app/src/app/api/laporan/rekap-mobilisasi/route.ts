import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { generateRekapMobilisasiXlsx } from "@/lib/laporan";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.ANALIS) {
    return new Response("Hanya Analis/Evaluator dan Super Admin yang dapat mengunduh laporan.", { status: 403 });
  }

  const xlsx = await generateRekapMobilisasiXlsx();
  return new Response(new Uint8Array(xlsx), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="rekap-mobilisasi.xlsx"',
    },
  });
}
