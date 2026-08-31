import { AppShell } from "@/components/shell/app-shell";
import { NewsTicker } from "@/components/shell/news-ticker";
import { auth } from "@/lib/auth";
import { getTopbarKpi } from "@/lib/overview-data";
import { getCakupanOptions } from "@/lib/cakupan-data";
import { getNewsTicker } from "@/lib/news-ticker";

export default async function CommandLayout({ children }: { children: React.ReactNode }) {
  const [session, kpi, headlines, cakupanOptions] = await Promise.all([
    auth(),
    getTopbarKpi(),
    getNewsTicker(),
    getCakupanOptions(),
  ]);

  return (
    <AppShell
      user={session?.user ?? null}
      kpi={kpi}
      cakupanOptions={cakupanOptions}
      // Dirender di sini (Server Component) lalu dioper sebagai node, bukan dioper datanya ke
      // AppShell yang "use client" — lihat catatan pada prop `ticker` di app-shell.tsx.
      ticker={<NewsTicker headlines={headlines} />}
    >
      {children}
    </AppShell>
  );
}
