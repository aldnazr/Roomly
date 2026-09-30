import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/login");
  const isGuestArea = pathname === "/guest" || pathname.startsWith("/guest/");
  const session = await auth();
  const role = session?.user.role;

  if (!session) {
    return (
      isAuthPage ?
        NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url))
    );
  }

  if (role === "guest") {
    return (
      isGuestArea ?
        NextResponse.next()
      : NextResponse.redirect(new URL("/guest", request.url))
    );
  }

  return isAuthPage ?
      NextResponse.redirect(new URL("/", request.url))
    : NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
