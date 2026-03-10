import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = ["/dashboard"];
  const adminRoutes = ["/admin"];

  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute || isAdminRoute) {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // For admin routes, check if user is admin
      if (isAdminRoute && !decoded.isAdmin) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
