import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/login");
  const session = await auth();
  const isAuthenticated = Boolean(session);
  const role = session?.user.role;

  if (isAuthPage) {
    return isAuthenticated ?
        NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  return isAuthenticated ?
      NextResponse.next()
    : NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
