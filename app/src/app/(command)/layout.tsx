import { AppShell } from "@/components/shell/app-shell";
import { auth } from "@/lib/auth";

export default async function CommandLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return <AppShell user={session?.user ?? null}>{children}</AppShell>;
}
