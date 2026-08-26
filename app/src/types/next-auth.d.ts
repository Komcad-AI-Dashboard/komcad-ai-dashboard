import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/constants";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      anggotaId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    anggotaId: string | null;
    /** Centang "Ingat saya" di form login — menentukan panjang masa sesi, lihat lib/auth.ts. */
    remember?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
    anggotaId?: string | null;
    /** Epoch ms kapan sesi ini harus dianggap kedaluwarsa (lihat callback jwt di lib/auth.ts). */
    expiresAt?: number;
  }
}
