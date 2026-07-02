import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_TOKEN_COOKIE,
} from "@/lib/auth/roles";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/rooms",
  "/library",
  "/friends",
  "/billing",
  "/profile",
  "/notifications",
  "/support",
];

function isDashboardPath(pathname: string): boolean {
  return DASHBOARD_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const devBypass = process.env.ADMIN_DEV_BYPASS === "true";

  if (pathname.startsWith("/admin")) {
    if (!token && !devBypass) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      url.searchParams.set("error", "admin_forbidden");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isDashboardPath(pathname) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/signup") && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/rooms",
    "/rooms/:path*",
    "/library",
    "/library/:path*",
    "/friends",
    "/friends/:path*",
    "/billing",
    "/billing/:path*",
    "/profile",
    "/profile/:path*",
    "/notifications",
    "/notifications/:path*",
    "/support",
    "/support/:path*",
    "/login",
    "/signup",
  ],
};
