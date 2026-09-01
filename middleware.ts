import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  authPathWithReturnTo,
  isPublicRoute,
  pathWithReturnTo
} from "@/lib/routing/auth-redirects";
import { AUTH_REFRESH_COOKIE } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicRoute(pathname);
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  if (isStatic) {
    return NextResponse.next();
  }

  const hasRefreshCookie = Boolean(request.cookies.get(AUTH_REFRESH_COOKIE)?.value);

  if (!hasRefreshCookie && !isPublic) {
    const returnTo = pathWithReturnTo(pathname, request.nextUrl.search);
    return NextResponse.redirect(
      new URL(authPathWithReturnTo("/login", returnTo), request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"]
};
