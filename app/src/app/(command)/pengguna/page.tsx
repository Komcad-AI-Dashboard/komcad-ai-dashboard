import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { getUserList, getRoleSummary } from "@/lib/user-data";
import { PenggunaView } from "@/components/pengguna/pengguna-view";

export default async function PenggunaPage() {
  const session = await auth();

  if (session?.user?.role !== ROLES.SUPER_ADMIN) {
    return (
      <div className="flex-1 p-5">
        <div className="rounded-[8px] border border-amber/40 bg-amber/10 px-3 py-2 text-[11.5px] text-amber">
          Menu Pengguna & Role hanya dapat diakses Super Admin.
        </div>
      </div>
    );
  }

  const [users, roleSummary] = await Promise.all([getUserList(), getRoleSummary()]);

  return <PenggunaView users={users} roleSummary={roleSummary} currentUserId={session.user.id} />;
}
