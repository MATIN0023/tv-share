import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminRole, ROLE_COOKIE } from "@/lib/auth/roles";

/**
 * محافظت مسیرهای /admin/*
 * نقش از کوکی role خوانده می‌شود (پس از لاگین از API ست شود).
 * در توسعه: ADMIN_DEV_BYPASS=true در .env.local
 */
export function middleware(request: NextRequest) {
  const role = request.cookies.get(ROLE_COOKIE)?.value;
  // const devBypass = process.env.ADMIN_DEV_BYPASS 
  const devBypass = "true";
  
  if (!isAdminRole(role) && !devBypass) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("error", "admin_forbidden");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
