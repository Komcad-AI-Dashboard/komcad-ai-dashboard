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
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
    anggotaId?: string | null;
  }
}
