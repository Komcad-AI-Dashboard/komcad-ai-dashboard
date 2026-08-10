// Data-fetching untuk Modul Sistem → Pengguna & Role. Hanya user Command Center (bukan ANGGOTA —
// akun Anggota dikelola lewat modul Data Anggota/CRUD Anggota, bukan di sini).
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

const COMMAND_ROLES = [ROLES.SUPER_ADMIN, ROLES.OPERATOR, ROLES.ANALIS];

export async function getUserList() {
  const users = await prisma.user.findMany({
    where: { role: { in: COMMAND_ROLES } },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
  });
  return users;
}

export type UserListItem = Awaited<ReturnType<typeof getUserList>>[number];

export async function getRoleSummary() {
  const groups = await prisma.user.groupBy({
    by: ["role"],
    where: { role: { in: COMMAND_ROLES } },
    _count: true,
  });
  return COMMAND_ROLES.map((role) => ({
    role,
    jumlah: groups.find((g) => g.role === role)?._count ?? 0,
  }));
}
