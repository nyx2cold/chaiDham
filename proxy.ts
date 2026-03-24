import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // If logged in and trying to access auth pages → redirect based on role
  if (token && (pathname === "/sign-in" || pathname === "/sign-up")) {
    if (token.role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/menu", request.url));
  }

  // If not logged in and trying to access protected pages → redirect to sign-in
  if (!token && (pathname.startsWith("/dashboard") || pathname.startsWith("/menu"))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If logged in as user trying to access dashboard → redirect to menu
  if (token && token.role === "user" && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/menu", request.url));
  }

  // If logged in as admin trying to access menu → redirect to dashboard
  // if (token && token.role === "admin" && pathname.startsWith("/menu")) {
  //   return NextResponse.redirect(new URL("/menu", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/dashboard/:path*", "/menu/:path*"],
};