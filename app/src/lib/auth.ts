import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  // FormData selalu mengirim string, jadi "true"/"false" — bukan boolean asli.
  remember: z.enum(["true", "false"]).optional(),
});

/** Masa sesi: panjang kalau "Ingat saya" dicentang, pendek kalau tidak. Cookie-nya sendiri
 * berumur SESI_PANJANG (lihat session.maxAge); yang menegakkan batas pendek adalah cek
 * `expiresAt` di callback jwt — supaya satu cookie bisa melayani dua panjang masa berbeda. */
const SESI_PANJANG_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari
const SESI_PENDEK_MS = 24 * 60 * 60 * 1000; // 1 hari

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: SESI_PANJANG_MS / 1000 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Ingat saya", type: "text" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password, remember } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        if (user.status === "Nonaktif") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as import("@/lib/constants").Role,
          anggotaId: user.anggotaId,
          remember: remember === "true",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.anggotaId = user.anggotaId;
        token.expiresAt = Date.now() + (user.remember ? SESI_PANJANG_MS : SESI_PENDEK_MS);
      }
      // Mengembalikan null = sesi dianggap habis dan pengguna diperlakukan sebagai belum masuk.
      if (token.expiresAt != null && Date.now() > token.expiresAt) return null;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role!;
        session.user.anggotaId = token.anggotaId ?? null;
      }
      return session;
    },
  },
});
