import { AppShell } from "@/components/shell/app-shell";
import { auth } from "@/lib/auth";
import { getTopbarKpi } from "@/lib/overview-data";

export default async function CommandLayout({ children }: { children: React.ReactNode }) {
  const [session, kpi] = await Promise.all([auth(), getTopbarKpi()]);

  return (
    <AppShell user={session?.user ?? null} kpi={kpi}>
      {children}
    </AppShell>
  );
}
