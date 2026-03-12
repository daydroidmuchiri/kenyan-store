// src/middleware.ts
// Protect admin routes and redirect unauthenticated users

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protect admin routes — require ADMIN role
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Run middleware on these paths
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Always allow public routes
        if (
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/payments/mpesa/callback") ||
          pathname === "/" ||
          pathname.startsWith("/shop") ||
          pathname.startsWith("/product") ||
          pathname.startsWith("/about") ||
          pathname.startsWith("/contact") ||
          pathname.startsWith("/delivery") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register")
        ) {
          return true;
        }

        // Require auth for account and checkout routes
        if (
          pathname.startsWith("/account") ||
          pathname.startsWith("/checkout") ||
          pathname.startsWith("/admin")
        ) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
