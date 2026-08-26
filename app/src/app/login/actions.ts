"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

export type LoginState = { error: string | null };

/** Akun observer read-only untuk tombol "Masuk sebagai tamu". ANALIS memang sudah tidak bisa
 * kelola anggota, buat misi, maupun buka Pengaturan — jadi tidak perlu role baru. Kredensialnya
 * bukan rahasia: ini akun demo berisi data dummy, dan sebelumnya malah dipajang di halaman login. */
const TAMU_EMAIL = "analis@komcad.mil.id";
const TAMU_PASSWORD = "komcad123";

/** Tujuan redirect ditentukan DI SINI dari role sungguhan (bukan hardcode "/overview" lalu
 * mengandalkan proxy.ts membelokkan ulang) — redirect yang dipicu dari dalam Server Action
 * adalah client-side transition yang tidak selalu memicu ulang proxy.ts di request berikutnya,
 * jadi ANGGOTA bisa nyangkut di Command Center kalau tujuannya salah sejak awal. Lookup by
 * email di sini aman: cuma menentukan URL, bukan pengganti verifikasi password di authorize(). */
async function tujuanUntuk(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  return user?.role === ROLES.ANGGOTA ? "/m" : "/overview";
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on" ? "true" : "false";

  try {
    await signIn("credentials", { email, password, remember, redirectTo: await tujuanUntuk(email) });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau kata sandi salah." };
    }
    throw error; // NEXT_REDIRECT dan error lain harus diteruskan, bukan ditelan di sini
  }
}

// Tanpa parameter: tombol tamu tidak membaca field apa pun dari form, dan useActionState tetap
// menerima action ber-parameter lebih sedikit.
export async function guestLoginAction(): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: TAMU_EMAIL,
      password: TAMU_PASSWORD,
      remember: "false", // sesi tamu sengaja pendek
      redirectTo: await tujuanUntuk(TAMU_EMAIL),
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Akun tamu tidak tersedia di lingkungan ini." };
    }
    throw error;
  }
}
