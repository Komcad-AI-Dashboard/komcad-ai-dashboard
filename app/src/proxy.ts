import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MEMBER_PREFIX = "/m";
const PUBLIC_PATHS = ["/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isPublic) {
    if (session && pathname === "/login") {
      const dest = session.user.role === "ANGGOTA" ? "/m" : "/overview";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const isMemberArea = pathname === MEMBER_PREFIX || pathname.startsWith(MEMBER_PREFIX + "/");

  // Anggota Komcad hanya boleh akses Sisi Anggota (FR-38 data isolation); role lain hanya Command Center.
  if (isMemberArea && session.user.role !== "ANGGOTA") {
    return NextResponse.redirect(new URL("/overview", req.url));
  }
  if (!isMemberArea && session.user.role === "ANGGOTA") {
    return NextResponse.redirect(new URL("/m", req.url));
  }

  return NextResponse.next();
});

// `brand` WAJIB ikut dikecualikan: aset di public/brand dipakai halaman login (belum ada sesi),
// dan optimizer _next/image mengambilnya lewat fetch server-side tanpa cookie — tanpa pengecualian
// ini semua gambar dibalas 307 ke /login lalu gagal dioptimasi ("isn't a valid image").
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|brand).*)"],
};
