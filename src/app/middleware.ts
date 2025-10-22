import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define routes to protect
const protectedRoutes = ["/home", "/dashboard", "/admin"]; // add all protected routes

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip non-protected routes
  if (!protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = req.cookies.get("admin_token")?.value;

  // Redirect to login if token missing
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply middleware to these paths
export const config = {
  matcher: ["/home/:path*", "/dashboard/:path*", "/admin/:path*"],
};
