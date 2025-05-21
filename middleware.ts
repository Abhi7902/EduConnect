import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const token = await getToken({ req });
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isAuth) {
      const role = token.role as string;
      
      // Direct teacher to teacher dashboard
      if (role === "TEACHER" && req.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/dashboard/teacher", req.url));
      }
      
      // Direct student to student dashboard
      if (role === "STUDENT" && req.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/dashboard/student", req.url));
      }

      // Protect teacher routes from students
      if (role === "STUDENT" && 
        (req.nextUrl.pathname.startsWith("/dashboard/teacher") || 
         req.nextUrl.pathname.startsWith("/classroom/create"))) {
        return NextResponse.redirect(new URL("/dashboard/student", req.url));
      }

      // Protect student routes from teachers
      if (role === "TEACHER" && req.nextUrl.pathname.startsWith("/dashboard/student")) {
        return NextResponse.redirect(new URL("/dashboard/teacher", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/classroom/:path*",
    "/login",
    "/register",
  ],
};