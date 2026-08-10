"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

export type LoginState = { error: string | null };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  // Tujuan redirect ditentukan DI SINI dari role sungguhan (bukan hardcode "/overview" lalu
  // mengandalkan proxy.ts membelokkan ulang) — redirect yang dipicu dari dalam Server Action
  // adalah client-side transition yang tidak selalu memicu ulang proxy.ts di request berikutnya,
  // jadi ANGGOTA bisa nyangkut di Command Center kalau tujuannya salah sejak awal. Lookup by
  // email di sini aman: cuma menentukan URL, bukan pengganti verifikasi password di authorize().
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  const dest = user?.role === ROLES.ANGGOTA ? "/m" : "/overview";

  try {
    await signIn("credentials", { email, password, redirectTo: dest });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau kata sandi salah." };
    }
    throw error; // NEXT_REDIRECT dan error lain harus diteruskan, bukan ditelan di sini
  }
}
