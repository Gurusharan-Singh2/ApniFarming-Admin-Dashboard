// // middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // export const runtime = "edge";

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("admin_token")?.value;
//   const { pathname } = req.nextUrl;

//   console.log("Middleware triggered for:", pathname);
//   console.log("All cookies:", req.cookies.getAll());
//   console.log("admin_token:", token);

//   // If user visits `/` and already has a token, redirect to `/home`
//   if (pathname === "/" && token) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/home";
//     return NextResponse.redirect(url);
//   }

//   // If user visits a protected route but doesn't have a token, redirect to `/`
//   const isProtectedRoute =
//     pathname.startsWith("/home") || pathname.startsWith("/admin");

//   if (isProtectedRoute && !token) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/";
//     return NextResponse.redirect(url);
//   }

//   // Continue normally otherwise
//   const res = NextResponse.next();
//   res.headers.set("x-middleware-debug", token || "no-token");
//   return res;
// }

// export const config = {
//   matcher: ["/", "/home", "/admin/:path*"], // include `/` as well for redirect logic
// };



// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  const { pathname } = req.nextUrl;



  if (pathname === "/" && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // 2️⃣ If user visits any route other than `/` without a token → redirect to `/`
  if (pathname !== "/" && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Continue normally otherwise
  const res = NextResponse.next();
  res.headers.set("x-middleware-debug", token || "no-token");
  return res;
}

// ✅ Match *all* routes so we can protect everything except `/`
export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"], // Exclude Next.js internals
};
