import { AppShell } from "@/components/shell/app-shell";
import { auth } from "@/lib/auth";
import { getTopbarKpi } from "@/lib/overview-data";
import { getNewsTicker } from "@/lib/news-ticker";

export default async function CommandLayout({ children }: { children: React.ReactNode }) {
  const [session, kpi, headlines] = await Promise.all([auth(), getTopbarKpi(), getNewsTicker()]);

  return (
    <AppShell user={session?.user ?? null} kpi={kpi} headlines={headlines}>
      {children}
    </AppShell>
  );
}
