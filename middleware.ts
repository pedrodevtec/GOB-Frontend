import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  authPathWithReturnTo,
  DEFAULT_LOGIN_REDIRECT,
  isAuthEntryRoute,
  isPublicRoute,
  pathWithReturnTo,
  RETURN_TO_PARAM,
  safeReturnPath
} from "@/lib/routing/auth-redirects";

const AUTH_COOKIE = "gob_access_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicRoute(pathname);
  const isAuthEntry = isAuthEntryRoute(pathname);
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  if (isStatic) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token && !isPublic) {
    const returnTo = pathWithReturnTo(pathname, request.nextUrl.search);
    return NextResponse.redirect(
      new URL(authPathWithReturnTo("/login", returnTo), request.url)
    );
  }

  if (token && isAuthEntry) {
    const requestedReturnTo = request.nextUrl.searchParams.get(RETURN_TO_PARAM);
    return NextResponse.redirect(
      new URL(safeReturnPath(requestedReturnTo, DEFAULT_LOGIN_REDIRECT), request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"]
};
