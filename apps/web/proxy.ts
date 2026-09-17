import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  const isAuthenticated = request.cookies.get("roomly_access_token");
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/login");

  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
