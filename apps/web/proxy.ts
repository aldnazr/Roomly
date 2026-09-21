import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";

// ponytail: guards routes by NextAuth session only. If a second cookie (e.g. a
// legacy access token) ever needs to gate access too, add it here rather than
// in a separate proxy.
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/login");
  const session = await auth();
  const isAuthenticated = Boolean(session);

  if (isAuthPage) {
    return isAuthenticated
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  return isAuthenticated
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
