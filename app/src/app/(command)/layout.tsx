import { AppShell } from "@/components/shell/app-shell";

export default function CommandLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
